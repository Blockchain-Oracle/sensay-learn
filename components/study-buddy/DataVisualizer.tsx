import { useRef, useEffect } from 'react'
import * as d3 from 'd3'

interface DataPoint {
  time: number
  value: number
  unit: string
  pH?: number
}

interface DataVisualizerProps {
  data: DataPoint[]
  experimentId: string
  width?: number
  height?: number
}

const DataVisualizer = ({ data, experimentId, width = 600, height = 400 }: DataVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  
  useEffect(() => {
    if (!svgRef.current || data.length === 0) return
    
    // Clear previous svg content
    d3.select(svgRef.current).selectAll('*').remove()
    
    const margin = { top: 40, right: 30, bottom: 60, left: 60 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom
    
    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
    
    // Create group for chart elements with margin
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
    
    // Set up scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: DataPoint) => d.time) || 0])
      .range([0, innerWidth])
    
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: DataPoint) => d.value) || 0])
      .nice()
      .range([innerHeight, 0])
      
    // Set up secondary y scale for pH (if applicable)
    const y2Scale = d3
      .scaleLinear()
      .domain([0, 14])  // pH range is 0-14
      .nice()
      .range([innerHeight, 0])
    
    // Create and configure axes
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)
    const y2Axis = d3.axisRight(y2Scale)
    
    // Add axes to chart
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .append('text')
      .attr('fill', 'currentColor')
      .attr('x', innerWidth / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text('Time (min)')
    
    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('fill', 'currentColor')
      .attr('transform', 'rotate(-90)')
      .attr('y', -45)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .text(`Volume (${data[0].unit})`)
    
    // Add pH axis if experiment is acid-base
    if (experimentId === 'acid-base') {
      g.append('g')
        .attr('transform', `translate(${innerWidth}, 0)`)
        .call(y2Axis)
        .append('text')
        .attr('fill', 'currentColor')
        .attr('transform', 'rotate(-90)')
        .attr('y', 45)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .text('pH')
    }
    
    // Add line for volume data
    const line = d3.line<DataPoint>()
      .x((d: DataPoint) => xScale(d.time))
      .y((d: DataPoint) => yScale(d.value))
      .curve(d3.curveMonotoneX)
    
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
      .attr('d', line)
    
    // Add circles for data points
    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d: DataPoint) => xScale(d.time))
      .attr('cy', (d: DataPoint) => yScale(d.value))
      .attr('r', 5)
      .attr('fill', '#3b82f6')
    
    // Add pH line if experiment is acid-base
    if (experimentId === 'acid-base' && data[0].pH !== undefined) {
      const pHLine = d3.line<DataPoint>()
        .x((d: DataPoint) => xScale(d.time))
        .y((d: DataPoint) => y2Scale(d.pH || 0))
        .curve(d3.curveMonotoneX)
      
      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')
        .attr('d', pHLine)
      
      g.selectAll('.ph-circle')
        .data(data)
        .join('circle')
        .attr('class', 'ph-circle')
        .attr('cx', (d: DataPoint) => xScale(d.time))
        .attr('cy', (d: DataPoint) => y2Scale(d.pH || 0))
        .attr('r', 5)
        .attr('fill', '#ef4444')
    }
    
    // Add chart title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(getChartTitle(experimentId))
      
    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-innerHeight)
          .tickFormat(() => '')
      )
      .attr('stroke-opacity', 0.1)
      .selectAll('line')
      .attr('stroke', '#000')
    
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .attr('stroke-opacity', 0.1)
      .selectAll('line')
      .attr('stroke', '#000')
      
    // Add legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 120}, ${margin.top})`)
    
    legend
      .append('rect')
      .attr('width', 110)
      .attr('height', experimentId === 'acid-base' ? 60 : 30)
      .attr('fill', 'white')
      .attr('stroke', '#ccc')
    
    legend
      .append('line')
      .attr('x1', 10)
      .attr('y1', 15)
      .attr('x2', 30)
      .attr('y2', 15)
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 3)
    
    legend
      .append('text')
      .attr('x', 35)
      .attr('y', 18)
      .text(`Volume (${data[0].unit})`)
      .style('font-size', '12px')
    
    if (experimentId === 'acid-base') {
      legend
        .append('line')
        .attr('x1', 10)
        .attr('y1', 40)
        .attr('x2', 30)
        .attr('y2', 40)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')
      
      legend
        .append('text')
        .attr('x', 35)
        .attr('y', 43)
        .text('pH')
        .style('font-size', '12px')
    }
    
    // Add animations
    g.selectAll('path')
      .attr('stroke-dasharray', function() { 
        return `${(this as SVGPathElement).getTotalLength()} ${(this as SVGPathElement).getTotalLength()}`
      })
      .attr('stroke-dashoffset', function() { 
        return (this as SVGPathElement).getTotalLength()
      })
      .transition()
      .duration(1500)
      .attr('stroke-dashoffset', 0)
    
    g.selectAll('circle')
      .attr('opacity', 0)
      .transition()
      .delay((_, i) => i * 300)
      .duration(500)
      .attr('opacity', 1)
      
  }, [data, experimentId, width, height])
  
  // Helper function for chart title
  const getChartTitle = (id: string): string => {
    switch(id) {
      case 'acid-base':
        return 'Acid-Base Titration Results'
      case 'pendulum':
        return 'Simple Pendulum Period vs Length'
      case 'photosynthesis':
        return 'Photosynthesis Rate vs Light Intensity'
      case 'density':
        return 'Density Determination Results'
      default:
        return 'Experiment Results'
    }
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow w-full h-full flex items-center justify-center">
      <svg ref={svgRef} className="max-w-full max-h-full" />
    </div>
  )
}

export default DataVisualizer 