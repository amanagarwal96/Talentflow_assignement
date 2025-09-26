import React from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Candidate } from '../../types';
import { User, Mail, ExternalLink } from 'lucide-react';

interface KanbanCardProps {
  candidate: Candidate;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({ candidate }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-testid="kanban-card"
      className={`bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'shadow-lg scale-105' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {candidate.name}
            </h4>
          </div>
        </div>
        
        <Link
          to={`/candidates/${candidate.id}`}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors z-10 relative"
          onClick={(e) => e.stopPropagation()}
          title={`View profile for ${candidate.name}`}
        >
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
      
      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
        <Mail className="w-3 h-3" />
        <span className="truncate">{candidate.email}</span>
      </div>
    </div>
  );
};