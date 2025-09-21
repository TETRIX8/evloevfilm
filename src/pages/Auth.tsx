
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation/Navigation";
import { AppWebGLBackground } from "@/components/animations/AppWebGLBackground";
import { FirebaseAuth } from "@/components/FirebaseAuth";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";

export default function Auth() {
  const navigate = useNavigate();
  const [firebaseMode, setFirebaseMode] = useState<"signin" | "signup">("signin");
  
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth();
  
  useEffect(() => {
    // Check if user is already logged in
    if (firebaseUser) {
      navigate("/");
    }
  }, [navigate, firebaseUser]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* WebGL Background */}
      <AppWebGLBackground />
      
      <Navigation />
      
      <div className="container min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <FirebaseAuth
            mode={firebaseMode}
            onModeChange={setFirebaseMode}
            onSuccess={() => navigate("/")}
          />
        </motion.div>
      </div>
    </div>
  );
}
