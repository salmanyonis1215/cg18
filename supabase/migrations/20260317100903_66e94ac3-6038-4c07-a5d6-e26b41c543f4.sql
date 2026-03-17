
-- 1. Create expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('salary', 'market', 'transport', 'other')),
  description text,
  amount numeric NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage expenses" ON public.expenses
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view expenses" ON public.expenses
  FOR SELECT TO authenticated
  USING (true);

-- 2. Add stock to products
ALTER TABLE public.products ADD COLUMN stock numeric DEFAULT 0;

-- 3. Add credit_limit and location to customers
ALTER TABLE public.customers ADD COLUMN credit_limit numeric DEFAULT NULL;
ALTER TABLE public.customers ADD COLUMN location text DEFAULT NULL;

-- 4. Trigger to reduce stock on sale
CREATE OR REPLACE FUNCTION public.handle_sale_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.products SET stock = stock - NEW.quantity WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_sale_reduce_stock
  AFTER INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.handle_sale_stock();

-- 5. Trigger to increase stock on delivery
CREATE OR REPLACE FUNCTION public.handle_delivery_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.products SET stock = stock + NEW.quantity WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_delivery_increase_stock
  AFTER INSERT ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.handle_delivery_stock();
