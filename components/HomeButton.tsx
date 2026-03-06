import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface HomeButtonProps {
  onClick: () => void;
  className?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ onClick, className = '' }) => {
  const { t } = useTranslation();

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5 transition-all duration-300 ${className}`}
      aria-label={t('common.returnHome')}
      title={t('common.returnHome')}
    >
      {/* Arrow icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        className="text-white/40 group-hover:text-[#d4af37] transition-colors duration-300"
      >
        <path
          d="M7 1L1 7L7 13M1 7H13"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[11px] uppercase tracking-[0.15em] text-white/40 group-hover:text-[#d4af37]/80 transition-colors duration-300 font-light">
        {t('common.home')}
      </span>
    </motion.button>
  );
};

export default HomeButton;
