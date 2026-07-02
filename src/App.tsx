import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "@/components/site/Layout";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Services from "./pages/Services.tsx";
import ServiceDetail from "./pages/ServiceDetail.tsx";
import Industries from "./pages/Industries.tsx";
import IndustryDetail from "./pages/IndustryDetail.tsx";
import CaseStudies from "./pages/CaseStudies.tsx";
import CaseStudyDetail from "./pages/CaseStudyDetail.tsx";
import Resources from "./pages/Resources.tsx";
import Faq from "./pages/Faq.tsx";
import LegalPage from "./pages/LegalPage.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Contact from "./pages/Contact.tsx";
import Auth from "./pages/Auth.tsx";
import Admin from "./pages/Admin.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const wrap = (el: React.ReactNode) => <Layout>{el}</Layout>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={wrap(<About />)} />
              <Route path="/services" element={wrap(<Services />)} />
              <Route path="/services/:slug" element={wrap(<ServiceDetail />)} />
              <Route path="/industries" element={wrap(<Industries />)} />
              <Route path="/industries/:slug" element={wrap(<IndustryDetail />)} />
              <Route path="/case-studies" element={wrap(<CaseStudies />)} />
              <Route path="/case-studies/:slug" element={wrap(<CaseStudyDetail />)} />
              <Route path="/resources" element={wrap(<Resources />)} />
              <Route path="/faq" element={wrap(<Faq />)} />
              <Route path="/legal/:slug" element={wrap(<LegalPage />)} />
              <Route path="/blog" element={wrap(<Blog />)} />
              <Route path="/blog/:slug" element={wrap(<BlogPost />)} />
              <Route path="/contact" element={wrap(<Contact />)} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
