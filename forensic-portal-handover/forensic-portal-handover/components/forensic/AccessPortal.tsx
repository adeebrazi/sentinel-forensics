import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint, Shield, UserCog, KeyRound, IdCard, Hash, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

type Role = "admin" | "employee";

export const AccessPortal = () => {
  const [role, setRole] = useState<Role>("admin");
  const [identifier, setIdentifier] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auth wiring placeholder
    console.log("[ACCESS_PORTAL] auth attempt", { role, identifier });
  };

  const config =
    role === "admin"
      ? {
          label: "ADMIN_ID",
          placeholder: "ADMIN-XXXX-XXXX",
          icon: <IdCard className="h-3.5 w-3.5" strokeWidth={1.5} />,
          clearance: "L5 · ROOT",
        }
      : {
          label: "EMPLOYEE_NO",
          placeholder: "EMP-000000",
          icon: <Hash className="h-3.5 w-3.5" strokeWidth={1.5} />,
          clearance: "L4 · OPERATIVE",
        };

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

        {/* Role selector */}
        <div className="relative mt-6">
          <div className="mb-2 flex items-center justify-between font-mono-tech text-[10px] text-primary/70">
            <span>SELECT_ROLE ::</span>
            <span className="text-[hsl(var(--success))]">SECURE_CHANNEL</span>
          </div>
          <div className="relative grid grid-cols-2 gap-0 border border-primary/30 bg-primary/5 p-1">
            <RoleTab
              active={role === "admin"}
              onClick={() => setRole("admin")}
              icon={<Shield className="h-3.5 w-3.5" strokeWidth={1.8} />}
              label="ADMIN"
            />
            <RoleTab
              active={role === "employee"}
              onClick={() => setRole("employee")}
              icon={<UserCog className="h-3.5 w-3.5" strokeWidth={1.8} />}
              label="EMPLOYEE"
            />
          </div>
        </div>

        {/* Credential form */}
        <form onSubmit={handleSubmit} className="relative mt-5 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              <FieldShell label={config.label} icon={config.icon}>
                <Input
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={config.placeholder}
                  className="h-9 border-0 bg-transparent px-0 font-mono-tech text-[12px] tracking-wider text-primary placeholder:text-primary/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </FieldShell>

              <FieldShell label="PASSKEY" icon={<KeyRound className="h-3.5 w-3.5" strokeWidth={1.5} />}>
                <div className="flex items-center gap-2">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="h-9 flex-1 border-0 bg-transparent px-0 font-mono-tech text-[12px] tracking-[0.3em] text-primary placeholder:text-primary/30 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="flex h-7 w-7 shrink-0 items-center justify-center border border-primary/30 bg-primary/5 text-primary/70 transition-colors hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" strokeWidth={1.8} />
                    ) : (
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </FieldShell>
            </motion.div>
          </AnimatePresence>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="relative mt-1 flex w-full items-center justify-center gap-3 overflow-hidden border border-primary/60 px-5 py-3.5 font-display text-sm font-bold tracking-widest text-primary-foreground transition-all"
            style={{
              background: "var(--gradient-cta)",
              boxShadow: "var(--glow-cyan)",
            }}
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 hover:translate-x-full" />
            AUTHENTICATE AS {role === "admin" ? "ADMIN" : "EMPLOYEE"}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-primary/20" />
          <span className="font-mono-tech text-[9px] text-primary/50">OR_FEDERATED_IDENTITY</span>
          <div className="h-px flex-1 bg-primary/20" />
        </div>

        {/* Continue with Google */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="relative flex w-full items-center justify-center gap-3 overflow-hidden border border-primary/40 bg-primary/5 px-5 py-3 font-display text-xs font-bold tracking-widest text-primary transition-all hover:bg-primary/10"
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

const RoleTab = ({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex items-center justify-center gap-2 px-3 py-2 font-display text-[11px] font-bold tracking-widest transition-all ${
      active
        ? "text-primary-foreground"
        : "text-primary/60 hover:text-primary"
    }`}
  >
    {active && (
      <motion.span
        layoutId="role-tab-active"
        className="absolute inset-0 border border-primary/70"
        style={{
          background: "var(--gradient-cta)",
          boxShadow: "var(--glow-cyan)",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
      />
    )}
    <span className="relative z-10 flex items-center gap-2">
      {icon}
      {label}
    </span>
  </button>
);

const FieldShell = ({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="border border-primary/25 bg-primary/[0.03] px-3 py-2 transition-colors focus-within:border-primary/60 focus-within:bg-primary/[0.06]">
    <div className="flex items-center justify-between font-mono-tech text-[9px] text-primary/60">
      <span className="flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className="h-1 w-1 rounded-full bg-primary/60 animate-pulse-cyan" />
    </div>
    {children}
  </div>
);

const GoogleLogo = () => (
  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  </span>
);
