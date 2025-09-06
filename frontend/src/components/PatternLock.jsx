// frontend/src/components/PatternLock.jsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

const PatternLock = ({ onPatternComplete, displayPattern = null, readOnly = false }) => {
  const [points, setPoints] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const svgRef = useRef(null);

  const GRID_SIZE = 3;
  const DOT_RADIUS = 10;
  const DOT_SPACING = 70;
  const SVG_SIZE = DOT_SPACING * GRID_SIZE;

  useEffect(() => {
    const newPoints = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        newPoints.push({
          id: i * GRID_SIZE + j + 1,
          x: j * DOT_SPACING + DOT_SPACING / 2,
          y: i * DOT_SPACING + DOT_SPACING / 2,
        });
      }
    }
    setPoints(newPoints);

    if (readOnly && displayPattern && newPoints.length > 0) {
      const patternPoints = displayPattern.split('-').map(id => {
        return newPoints.find(p => p.id === parseInt(id));
      }).filter(Boolean); // Filtra por si hay algún id inválido
      setCurrentPath(patternPoints);
    }

  }, [readOnly, displayPattern]);

  const getPointFromEvent = (e) => {
    if (!svgRef.current) return null;
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = e.clientX || e.touches[0].clientX;
    svgPoint.y = e.clientY || e.touches[0].clientY;
    const invertedMatrix = svgRef.current.getScreenCTM().inverse();
    return svgPoint.matrixTransform(invertedMatrix);
  };

  const handleInteractionStart = useCallback((e) => {
    if (readOnly) return;
    e.preventDefault();
    setIsDrawing(true);
  }, [readOnly]);

  const handleInteractionMove = useCallback((e) => {
    if (!isDrawing || readOnly) return;
    e.preventDefault();
    const pos = getPointFromEvent(e);
    if (pos) {
      setMousePos(pos);
      points.forEach(p => {
        const distance = Math.sqrt(Math.pow(pos.x - p.x, 2) + Math.pow(pos.y - p.y, 2));
        if (distance < DOT_RADIUS * 1.5 && !currentPath.some(cp => cp.id === p.id)) {
          setCurrentPath(prev => [...prev, p]);
        }
      });
    }
  }, [isDrawing, points, currentPath, readOnly]);

  const handleInteractionEnd = useCallback(() => {
    if (isDrawing && !readOnly) {
      setIsDrawing(false);
      if (onPatternComplete) {
        onPatternComplete(currentPath.map(p => p.id).join('-'));
      }
    }
  }, [isDrawing, currentPath, onPatternComplete, readOnly]);

  const resetPattern = () => {
    if (readOnly) return;
    setCurrentPath([]);
    if (onPatternComplete) {
      onPatternComplete('');
    }
  };

  const pathData = currentPath.map(p => `${p.x},${p.y}`).join(' ');
  const dynamicLine = isDrawing && currentPath.length > 0 ? ` M ${currentPath[currentPath.length - 1].x},${currentPath[currentPath.length - 1].y} L ${mousePos.x},${mousePos.y}` : '';

  return (
    <div className="flex flex-col items-center">
      <svg
        ref={svgRef}
        width={SVG_SIZE}
        height={SVG_SIZE}
        className={`bg-gray-50 border border-gray-300 rounded-lg touch-none ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        onMouseDown={handleInteractionStart}
        onMouseMove={handleInteractionMove}
        onMouseUp={handleInteractionEnd}
        onMouseLeave={handleInteractionEnd}
        onTouchStart={handleInteractionStart}
        onTouchMove={handleInteractionMove}
        onTouchEnd={handleInteractionEnd}
      >
        <motion.polyline
          points={pathData}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d={dynamicLine} stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" strokeDasharray="5,5" />
        {points.map(p => {
          const isSelected = currentPath.some(cp => cp.id === p.id);
          return (
            <motion.circle
              key={p.id}
              cx={p.x}
              cy={p.y}
              r={DOT_RADIUS}
              fill={isSelected ? '#4f46e5' : '#d1d5db'}
              animate={{ scale: isSelected ? 1.5 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            />
          );
        })}
      </svg>
      {!readOnly && (
        <button
          type="button"
          onClick={resetPattern}
          className="mt-3 flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-semibold"
        >
          <RotateCcw size={14} />
          Limpiar
        </button>
      )}
    </div>
  );
};

export default PatternLock;