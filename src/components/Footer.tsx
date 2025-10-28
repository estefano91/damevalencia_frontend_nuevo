import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/disclaimer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Disclaimer
            </Link>
            <Link
              to="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Use
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} AURA Sports. All rights reserved.
          </p>
        </div>
        
        <Separator className="my-4" />
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            AURA Sports is a digital intermediation platform connecting professionals in the sports ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


