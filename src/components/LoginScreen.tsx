import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@totesoft/ui-kit";
import { Button } from "@totesoft/ui-kit";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";

type LoginScreenProps = {
  keycloak: any;
};

export function LoginScreen({ keycloak }: LoginScreenProps) {
  return (
    <div className="flex-1 flex min-h-screen items-center justify-center bg-black  p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-lg border border-gray-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              You are logged out
            </CardTitle>
            <CardDescription className="text-gray-400 text-xl mt-2">
              Please login to continue to CertManager.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 mt-4">
            <Button
              className="w-full bg-blue-500 hover:bg-blue-400 flex items-center text-white text-xl justify-center gap-2"
              variant="outline"
              size="lg"
              onClick={() => keycloak.login()}
            >
              <LogIn className="w-8 h-5" />
              Login
            </Button>
            <p className="text-sm text-gray-400 text-center">
              You need to authenticate to access the protected content.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
