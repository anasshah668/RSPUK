import React from 'react';
import Chart from 'react-apexcharts';

const formatMonthLabel = (yearMonth) => {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
};

const chartFont = 'Lexend Deca, sans-serif';

export const RevenueColumnChart = ({ revenueByMonth = [] }) => {
  const categories = revenueByMonth.map((item) => formatMonthLabel(item._id));
  const revenueData = revenueByMonth.map((item) => Number(item.revenue || 0));

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      fontFamily: chartFont,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        endingShape: 'rounded',
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    colors: ['#2563eb'],
    xaxis: {
      categories,
      labels: {
        style: { fontFamily: chartFont },
      },
    },
    yaxis: {
      title: {
        text: 'Revenue (£)',
        style: { fontFamily: chartFont },
      },
      labels: {
        formatter: (value) => `£${Math.round(value).toLocaleString()}`,
        style: { fontFamily: chartFont },
      },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (value, { dataPointIndex }) => {
          const orders = revenueByMonth[dataPointIndex]?.orders || 0;
          return `£${Number(value).toLocaleString()} (${orders} order${orders === 1 ? '' : 's'})`;
        },
      },
    },
    grid: {
      borderColor: '#e5e7eb',
    },
  };

  const series = [{ name: 'Revenue', data: revenueData }];

  if (!revenueByMonth.length) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center" style={{ fontFamily: chartFont }}>
        No revenue data yet.
      </p>
    );
  }

  return <Chart options={options} series={series} type="bar" height={350} />;
};

export const NewUsersChart = ({ usersByMonth = [] }) => {
  const categories = usersByMonth.map((item) => formatMonthLabel(item._id));
  const userData = usersByMonth.map((item) => Number(item.count || 0));

  const options = {
    chart: {
      type: 'area',
      height: 350,
      toolbar: { show: false },
      fontFamily: chartFont,
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    colors: ['#9333ea'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories,
      labels: {
        style: { fontFamily: chartFont },
      },
    },
    yaxis: {
      title: {
        text: 'New users',
        style: { fontFamily: chartFont },
      },
      labels: {
        formatter: (value) => Math.round(value).toLocaleString(),
        style: { fontFamily: chartFont },
      },
      min: 0,
      forceNiceScale: true,
    },
    tooltip: {
      y: {
        formatter: (value) => `${Math.round(value)} new user${value === 1 ? '' : 's'}`,
      },
    },
    grid: {
      borderColor: '#e5e7eb',
    },
  };

  const series = [{ name: 'New Users', data: userData }];

  if (!usersByMonth.length) {
    return (
      <p className="text-gray-500 text-sm py-8 text-center" style={{ fontFamily: chartFont }}>
        No user registration data yet.
      </p>
    );
  }

  return <Chart options={options} series={series} type="area" height={350} />;
};
