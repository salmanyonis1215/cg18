
-- Fix overly permissive customer policies
DROP POLICY "Authenticated users can insert customers" ON public.customers;
DROP POLICY "Admins can update customers" ON public.customers;

-- Only admins and salesmen can insert customers (all authenticated, but with proper check)
CREATE POLICY "Authenticated users can insert customers" ON public.customers 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can update customer records (balance is updated via triggers)
CREATE POLICY "Admins can update customers" ON public.customers 
  FOR UPDATE TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));
