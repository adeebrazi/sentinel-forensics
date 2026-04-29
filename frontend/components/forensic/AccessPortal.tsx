import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Shield, UserCog, KeyRound, IdCard, Hash, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

type Role = "admin" | "employee";

export const AccessPortal = () => {
  const [role, setRole] = useState<Role>("admin");
  const [identifier, setIdentifier] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const router = useRouter();

  const [authError, setAuthError] = useState("");

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send the Google token to our Python Backend for secure verification
        const response = await axios.post('https://sentinel-forensics.onrender.com/auth/verify-google', {
          access_token: tokenResponse.access_token
        });
        
        const { role, email } = response.data;
        
        // Backend confirmed the user is authorized and gave us their true role
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", email);
        console.log("[ACCESS_PORTAL] secure backend auth success", { role, email });
        window.location.href = "/ingestion";
        
      } catch (error: any) {
        if (error.response?.data?.detail) {
          setAuthError(error.response.data.detail.toUpperCase());
        } else {
          setAuthError("ERROR: FAILED TO VERIFY IDENTITY WITH COMMAND SERVER.");
        }
      }
    },
    onError: () => setAuthError("ERROR: Google Login Failed.")
  });

  const config =
    role === "admin"
      ? { clearance: "L5 · ROOT" }
      : { clearance: "L4 · OPERATIVE" };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
      className="relative w-full max-w-md"
    >
      <div
        className="corner-frame relative overflow-hidden border border-primary/50 bg-card/60 p-7 backdrop-blur-xl scanline"
        style={{ boxShadow: "var(--glow-panel)" }}
      >
        {/* Animated scan sweep */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan-sweep" />
        </div>

        {/* Header */}
        <div className="relative space-y-1.5">
          <div className="flex items-center gap-2 font-mono-tech text-[10px] text-primary/80">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-cyan" />
            SECURE_AUTHENTICATION_PROTOCOL
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-primary text-glow">
            ACCESS PORTAL
          </h1>
          <p className="font-mono-tech text-xs text-muted-foreground">
            Authorized personnel only · Clearance {config.clearance}
          </p>
        </div>



        {/* Credential form REMOVED - Enforcing SSO Only */}
        <div className="relative mt-8 mb-6">
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <Lock className="text-primary/40 h-8 w-8 mb-2" />
            <p className="font-mono-tech text-[11px] text-primary/70">
              MANUAL AUTHENTICATION DISABLED
            </p>
            <p className="font-mono-tech text-[9px] text-primary/50">
              SYSTEM REQUIRES FEDERATED IDENTITY VERIFICATION
            </p>
          </div>

          {authError && (
            <div className="mb-4 border border-red-500/40 bg-red-500/10 p-3 text-center animate-pulse">
              <span className="font-mono-tech text-[10px] font-bold text-red-500 uppercase tracking-widest">
                {authError}
              </span>
            </div>
          )}
        </div>

        {/* Continue with Google */}
        <motion.button
          type="button"
          onClick={handleGoogleLogin}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative flex w-full items-center justify-center gap-3 overflow-hidden border border-primary/40 bg-primary/5 px-5 py-3 font-display text-xs font-bold tracking-widest text-primary transition-all hover:bg-primary/10"
          style={{
            background: "var(--gradient-cta)",
            boxShadow: "var(--glow-cyan)",
            color: "var(--primary-foreground)"
          }}
        >
          <GoogleLogo />
          CONTINUE WITH GOOGLE
        </motion.button>

        <div className="mt-3 text-center font-mono-tech text-[10px] text-primary/70">
          SSO ▸ FEDERATED IDENTITY ▸ ZERO-TRUST
        </div>
      </div>
    </motion.div>
  );
};

const GoogleLogo = () => (
  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  </span>
);
