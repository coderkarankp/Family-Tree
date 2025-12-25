import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { FamilyMember } from '../types';

interface TreeVisualizerProps {
  members: FamilyMember[];
  onSelectMember: (id: string) => void;
  selectedId: string | null;
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ members, onSelectMember, selectedId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight
            });
        }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!members.length || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const { width, height } = dimensions;
    const margin = { top: 50, right: 90, bottom: 50, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Convert flat data to hierarchy
    let root: d3.HierarchyNode<FamilyMember>;
    try {
      root = d3.stratify<FamilyMember>()
        .id(d => d.id)
        .parentId(d => d.parentId)(members);
    } catch (e) {
      console.error("Invalid tree structure:", e);
      // Fallback for empty or broken tree
      svg.append("text")
         .attr("x", width / 2)
         .attr("y", height / 2)
         .attr("text-anchor", "middle")
         .attr("fill", "#ef4444")
         .text("Invalid Tree Structure. Ensure only one root exists.");
      return;
    }

    const treeLayout = d3.tree<FamilyMember>()
      .size([innerWidth, innerHeight])
      .nodeSize([240, 160]); // Increased spacing for readability

    // Compute layout
    const treeData = treeLayout(root);

    // FIX: Initialize Group 'g' BEFORE defining zoom behavior
    const g = svg.append("g");

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Centering the tree initially
    const initialTransform = d3.zoomIdentity.translate(width / 2, 80).scale(0.85);
    svg.call(zoom.transform, initialTransform);

    // Links
    g.selectAll(".link")
      .data(treeData.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#d1d5db") // Light gray for subtle links
      .attr("stroke-width", 2)
      .attr("d", d3.linkVertical()
        .x((d: any) => d.x)
        .y((d: any) => d.y) as any
      );

    // Nodes
    const node = g.selectAll(".node")
      .data(treeData.descendants())
      .enter().append("g")
      .attr("class", d => `node ${d.data.id === selectedId ? "selected" : ""}`)
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .on("click", (event, d) => {
        event.stopPropagation();
        onSelectMember(d.data.id);
      })
      .style("cursor", "pointer");

    // Node Card Shape
    node.append("rect")
      .attr("width", 220) // Wider for readability
      .attr("height", 110)
      .attr("x", -110)
      .attr("y", -55)
      .attr("rx", 12)
      .attr("ry", 12)
      .attr("fill", d => d.data.id === selectedId ? "#fef2f2" : "white") // Red-50 if selected
      .attr("stroke", d => d.data.id === selectedId ? "#dc2626" : "#e5e7eb") // Red-600 if selected
      .attr("stroke-width", d => d.data.id === selectedId ? 3 : 1)
      .style("filter", "drop-shadow(0px 4px 6px rgba(0,0,0,0.05))");

    // Profile Circle placeholder
    node.append("circle")
      .attr("cx", 0)
      .attr("cy", -55)
      .attr("r", 24)
      .attr("fill", d => d.data.gender === 'female' ? "#fee2e2" : "#f3f4f6") // Red-100 or Gray-100
      .attr("stroke", d => d.data.id === selectedId ? "#dc2626" : "white")
      .attr("stroke-width", 2);
    
    // Gender Icon
    node.append("text")
        .attr("x", 0)
        .attr("y", -48)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("fill", "#374151")
        .text(d => d.data.gender === 'female' ? "♀" : "♂");

    // Name
    node.append("text")
      .attr("dy", "-10")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .attr("font-size", "16px") // Larger font
      .attr("fill", "#111827") // Darker black for readability
      .text(d => d.data.name)
      .each(function(d) {
          // Truncate if too long
          const self = d3.select(this);
          let textLength = self.node()?.getComputedTextLength() || 0;
          let text = d.data.name;
          while (textLength > 200 && text.length > 0) {
              text = text.slice(0, -1);
              self.text(text + "...");
              textLength = self.node()?.getComputedTextLength() || 0;
          }
      });

    // Regional Name
    node.append("text")
      .attr("dy", "12")
      .attr("x", 0)
      .attr("text-anchor", "middle")
      .attr("class", "lang-script")
      .attr("fill", "#dc2626") // Red color for regional name
      .attr("font-weight", "500")
      .attr("font-size", "15px")
      .text(d => d.data.regionalName || "");

    // Spouse Info
    node.each(function(d) {
        if (d.data.spouseName) {
            d3.select(this).append("text")
                .attr("dy", "32")
                .attr("x", 0)
                .attr("text-anchor", "middle")
                .attr("font-size", "13px")
                .attr("fill", "#4b5563")
                .text(`❤️ ${d.data.spouseName}`);
            
            if (d.data.spouseRegionalName) {
                d3.select(this).append("text")
                    .attr("dy", "48")
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .attr("class", "lang-script")
                    .attr("font-size", "13px")
                    .attr("fill", "#ef4444") // Lighter red for spouse regional
                    .text(d.data.spouseRegionalName);
            }
        }
    });

  }, [members, dimensions, selectedId, onSelectMember]);

  return (
    <div ref={containerRef} className="w-full h-full bg-white overflow-hidden relative" id="tree-container">
      <svg ref={svgRef} width="100%" height="100%" className="cursor-grab active:cursor-grabbing"></svg>
      <div className="absolute bottom-4 left-4 bg-white/90 border border-gray-200 p-2 rounded-lg shadow-sm text-xs text-gray-500 pointer-events-none">
        Use scroll to zoom, drag to pan.
      </div>
    </div>
  );
};

export default TreeVisualizer;