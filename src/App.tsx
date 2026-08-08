import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import Publish from "./pages/Publish";
import ToyDetail from "./pages/ToyDetail";
import Admin from "./pages/Admin";
import FAQ from "./pages/FAQ";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Contact from "./pages/Contact";
import Favorites from "./pages/Favorites";
import Store3D from "./pages/Store3D";
import NotFound from "./pages/NotFound";
import { AccessibilityPanel } from "./components/AccessibilityPanel";
import { AvatarOnboarding } from "./components/AvatarCreator";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/toy/:id" element={<ToyDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/store3d" element={<Store3D />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AccessibilityPanel />
        <AvatarOnboarding />

      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
