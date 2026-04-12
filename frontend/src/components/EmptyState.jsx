import React from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function EmptyState({ icon, title, description, actionButton }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-6 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50"
    >
      <div className="w-20 h-20 mb-6 bg-white rounded-full shadow-airbnb flex items-center justify-center text-gray-400 text-3xl">
        <FontAwesomeIcon icon={icon} />
      </div>
      <h3 className="text-2xl font-bold text-dark mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      {actionButton && (
        <div>
          {actionButton}
        </div>
      )}
    </motion.div>
  )
}