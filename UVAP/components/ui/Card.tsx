
import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-2xl shadow-lg p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<CardProps> = ({ children, className }) => (
  <h3 className={`text-xl font-semibold text-white ${className}`}>{children}</h3>
);

export const CardDescription: React.FC<CardProps> = ({ children, className }) => (
  <p className={`text-sm text-slate-400 ${className}`}>{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export default Card;
