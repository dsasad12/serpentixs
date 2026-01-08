import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

const Tabs = ({ tabs, defaultTab, activeTab: controlledActiveTab, onChange, variant = 'default' }: TabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const variantStyles = {
    default: {
      container: 'bg-dark-900/50 p-1 rounded-xl',
      tab: 'px-4 py-2 rounded-lg',
      active: 'bg-dark-800 text-white',
      inactive: 'text-dark-400 hover:text-white hover:bg-dark-800/50',
    },
    pills: {
      container: 'space-x-2',
      tab: 'px-4 py-2 rounded-full',
      active: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white',
      inactive: 'text-dark-400 hover:text-white bg-dark-800/50 hover:bg-dark-800',
    },
    underline: {
      container: 'border-b border-dark-800',
      tab: 'px-4 py-3 border-b-2 -mb-px',
      active: 'border-primary-500 text-white',
      inactive: 'border-transparent text-dark-400 hover:text-white hover:border-dark-600',
    },
  };

  const styles = variantStyles[variant];
  const hasContent = tabs.some(tab => tab.content);

  return (
    <div>
      {/* Tab List */}
      <div className={`flex ${styles.container}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`
              ${styles.tab}
              ${activeTab === tab.id ? styles.active : styles.inactive}
              flex items-center gap-2 font-medium transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {hasContent && (
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {tabs.map((tab) =>
              activeTab === tab.id && tab.content ? (
                <motion.div
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.content}
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// Accordion Component
interface AccordionItem {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}

const Accordion = ({ items, allowMultiple = false, defaultOpen = [] }: AccordionProps) => {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);

        return (
          <div
            key={item.id}
            className="bg-dark-900/50 border border-dark-800 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => toggleItem(item.id)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-dark-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="font-medium text-white">{item.title}</span>
              </div>
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-dark-400" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-6 pb-4 text-dark-300">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export { Tabs, Accordion };
