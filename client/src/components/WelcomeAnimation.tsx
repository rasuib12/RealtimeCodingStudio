import { motion } from 'framer-motion';
import { Code2, Users, MessageSquare, Pen } from 'lucide-react';

export function WelcomeAnimation() {
  return (
    <div className="relative w-full h-[400px] overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
      {/* Animated code editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-background rounded-lg shadow-lg"
      >
        <div className="h-6 bg-muted flex items-center px-2 rounded-t-lg">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
          </div>
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "60%" }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="h-3 bg-primary/20 mt-3 ml-4 rounded"
        />
      </motion.div>

      {/* Floating feature icons */}
      <motion.div
        animate={{ 
          rotate: [0, 360],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 left-1/4"
      >
        <Code2 className="w-8 h-8 text-primary" />
      </motion.div>

      <motion.div
        animate={{ 
          rotate: [0, 360],
          y: [0, 10, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: 0.5
        }}
        className="absolute bottom-1/4 right-1/4"
      >
        <Users className="w-8 h-8 text-primary" />
      </motion.div>

      <motion.div
        animate={{ 
          rotate: [0, 360],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: 1
        }}
        className="absolute top-1/3 right-1/3"
      >
        <MessageSquare className="w-8 h-8 text-primary" />
      </motion.div>

      <motion.div
        animate={{ 
          rotate: [0, 360],
          y: [0, 10, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "linear",
          delay: 1.5
        }}
        className="absolute bottom-1/3 left-1/3"
      >
        <Pen className="w-8 h-8 text-primary" />
      </motion.div>
    </div>
  );
}
