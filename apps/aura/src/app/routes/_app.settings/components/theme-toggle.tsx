import { selectPreferredTheme, setPrefferedTheme } from '@/BrightID/actions';
import { useDispatch, useSelector } from '@/store/hooks';
import { FaMoon, FaSun } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToggleTheme() {
  const dispatch = useDispatch();
  const prefferedTheme = useSelector(selectPreferredTheme);
  const isDark = prefferedTheme === 'dark';

  return (
    <a-card
      data-testid="toggle-theme-btn"
      onClick={() => dispatch(setPrefferedTheme(isDark ? 'light' : 'dark'))}
      className="flex cursor-pointer items-center justify-between rounded-lg py-3.5 pl-5 pr-5 transition-colors duration-500"
    >
      <span className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <FaMoon size={20} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.3 }}
            >
              <FaSun size={20} />
            </motion.span>
          )}
        </AnimatePresence>
        <p className="text-[20px] font-medium">Theme</p>
      </span>
      <motion.small
        key={prefferedTheme}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        data-testid={`theme-${prefferedTheme}`}
      >
        {prefferedTheme.toUpperCase()}
      </motion.small>
    </a-card>
  );
}
