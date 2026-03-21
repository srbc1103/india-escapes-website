'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
};

export default function BreadCrumb({ options, active, separator = '/' }) {
  return (
    <div aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-xs md:text-sm uppercase">
      {options.map((option, index) => {
        const { text, url } = option;
        const isActive = text === active;
        const isLast = index === options.length - 1;

        return (
          <motion.div
            key={text}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center"
          >
            {/* Breadcrumb Item */}
            {isActive ? (
              <span
                className="font-medium text-gray-800 dark:text-gray-200"
                aria-current="page"
              >
                {text}
              </span>
            ) : url ? (
              <Link
                href={url}
                className="text-gray-500 hover:text-black hover:underline focus:outline-none focus:underline dark:text-gray-400 dark:hover:text-gray-600"
                aria-label={`Navigate to ${text}`}
              >
                {text}
              </Link>
            ) : (
              <span className="text-gray-500 dark:text-gray-500">{text}</span>
            )}

            {/* Separator */}
            {!isLast && (
              <span className="mx-1 text-gray-400 dark:text-gray-500">
                {separator}
              </span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}