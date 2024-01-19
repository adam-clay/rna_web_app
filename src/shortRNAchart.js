import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import {Chart, ArcElement, Legend} from 'chart.js'
import { Doughnut } from 'react-chartjs-2';
import './shortRNAchart.css';

// encountered errors, registering these elements was required
Chart.register(ArcElement);
Chart.register(Legend)


function RNAChart() {
  // chart and file stuff
  const [filenames, setFilenames] = useState([]);
  const [selectedFile, setSelectedFile] = useState();

  // necessary complication to include percentages
  const [chartData, setChartData] = useState({
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }]
  });

  // unique chart data
  const [uniqueChartData, setUniqueChartData] = useState({
      labels: [],
      datasets: [{ data: [], backgroundColor: [] }]
  });


  //percentage stuff
  const dataValues = chartData.datasets[0].data;
  const total = dataValues.reduce((acc, value) => acc + value, 0);
  const percentages = dataValues.map(value => (value / total * 100).toFixed(5));

  //unique percentage stuff
  const uniqueDataValues = uniqueChartData.datasets[0].data;
  const uniqueTotal = uniqueDataValues.reduce((acc, value) => acc + value, 0);
  const uniquePercentages = uniqueDataValues.map(value => (value / uniqueTotal * 100).toFixed(5));

  useEffect(() => {
    // get filenames from the fastapi backend
    Axios.get('http://127.0.0.1:8000/filenames')
      .then(response => {
        // make dropdown cleaner
        const shortenedFilenames = response.data.filenames.map(filename => filename.split('.')[1]);
        setFilenames(shortenedFilenames);
        if(shortenedFilenames.length > 0) {
            setSelectedFile(shortenedFilenames[0]);
          }          
      })
  }, []);


  useEffect(() => {
    if (selectedFile) {
      // get RNA data for the selected file
      Axios.get(`http://127.0.0.1:8000/data/data.${selectedFile}.expression.tsv`)
        .then(response => {
          
          const labels = response.data.data.map(i => i[0]);
          const data = response.data.data.map(i => i[1]);
          const uniqueData = response.data.unique_data.map(i => i[1]);
          
          const bg_colors = [
            '#E57373', 
            '#81C784', 
            '#64B5F6', 
            '#FFD54F', 
            '#BA68C8', 
            '#4DB6AC', 
            '#FF8A65', 
            '#7986CB', 
            '#A1887F']

          setChartData({
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: bg_colors,
            }]
          });

          setUniqueChartData({
            labels: labels,
            datasets: [{
              data: uniqueData,
              backgroundColor: bg_colors,
            }]
          });
        });
    }
  }, [selectedFile]);

  // render legend with percentages
  const options = {
  plugins: {
      legend: {
      labels: {
          generateLabels: (RNAchart) => {
          const data = RNAchart.data;
          {
              return data.labels.map((label, i) => {
              const dataset = data.datasets[0];
              const percentage = percentages[i];
              return {
                text: label + ": (" + percentage + "%)",
                  fillStyle: dataset.backgroundColor[i]
              };
              });
          }
          }
      }
      }
  }
  };

  // render unique legend with percentages
  const unique_options = {
      plugins: {
          legend: {
          labels: {
              generateLabels: (uniqueRNAchart) => {
              const data = uniqueRNAchart.data;
              {
                  return data.labels.map((label, i) => {
                  const dataset = data.datasets[0];
                  const percentage = uniquePercentages[i];
                  return {
                    text: label + ": (" + percentage + "%)",
                      fillStyle: dataset.backgroundColor[i]
                  };
                  });
              }
              }
          }
          }
      }
  };

  

  return (
    <div className='chart-container'>
      {/* Dropdown */}
      <select value={selectedFile} onChange={dist => setSelectedFile(dist.target.value)}>
        {filenames.map(file => (
          <option key={file} value={file}>{file}</option>
        ))}
      </select>

      {/* Donut chart display */}
      {chartData && chartData.labels && (
  <>
      <h2>Sequences/Molecules Across Types</h2>
      <Doughnut data={chartData} options={options}/>
  </>
  )}

      {/* Unique Donut chart display */}
      {uniqueChartData && uniqueChartData.labels && (
  <>
      <h2>Unique Sequences/Molecules Across Types</h2>
      <Doughnut data={uniqueChartData} options={unique_options}/>
  </>
  )}
    </div>
  );
}

export default RNAChart;