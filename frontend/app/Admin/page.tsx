"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Users, UserCheck, CreditCard, TrendingUp, Activity, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import * as Chart from 'chart.js';

// Register Chart.js components - including DoughnutController
Chart.Chart.register(
  Chart.CategoryScale,
  Chart.LinearScale,
  Chart.PointElement,
  Chart.LineElement,
  Chart.BarElement,
  Chart.ArcElement,
  Chart.DoughnutController,
  Chart.LineController,
  Chart.BarController,
  Chart.Title,
  Chart.Tooltip,
  Chart.Legend,
  Chart.Filler,
);

// TypeScript interfaces based on database schema
interface DashboardMetrics {
  totalDentists: number;
  totalPatients: number;
  totalReceptionists: number;
  totalAppointments: number;
  monthlyRevenue: number;
  pendingAppointments: number;
}

interface PaymentTrend {
  month: string;
  revenue: number;
  appointments: number;
}

interface AppointmentStatus {
  name: string;
  value: number;
  color: string;
}

interface ServiceType {
  service: string;
  count: number;
  revenue: number;
}

interface PaymentStatus {
  status: string;
  count: number;
  percentage: number;
}

const DentalDashboard: React.FC = () => {
  // Refs for chart canvases
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  
  // Chart instances
  const pieChartInstance = useRef<Chart.Chart | null>(null);
  const lineChartInstance = useRef<Chart.Chart | null>(null);
  const barChartInstance = useRef<Chart.Chart | null>(null);

  // State with proper TypeScript typing
  const [dashboardData, setDashboardData] = useState<DashboardMetrics>({
    totalDentists: 15,
    totalPatients: 245,
    totalReceptionists: 8,
    totalAppointments: 156,
    monthlyRevenue: 125400,
    pendingAppointments: 23
  });

  // Payment analysis data (right side)
  const paymentTrends: PaymentTrend[] = [
    { month: 'Jan', revenue: 95000, appointments: 145 },
    { month: 'Feb', revenue: 108000, appointments: 160 },
    { month: 'Mar', revenue: 118000, appointments: 175 },
    { month: 'Apr', revenue: 112000, appointments: 168 },
    { month: 'May', revenue: 125400, appointments: 185 },
    { month: 'Jun', revenue: 132000, appointments: 195 }
  ];

  // Appointment status distribution (left side)
  const appointmentStatus: AppointmentStatus[] = [
    { name: 'Completed', value: 78, color: '#10B981' },
    { name: 'Scheduled', value: 45, color: '#3B82F6' },
    { name: 'Cancelled', value: 12, color: '#EF4444' },
    { name: 'No Show', value: 8, color: '#F59E0B' }
  ];

  // Service type popularity
  const serviceTypes: ServiceType[] = [
    { service: 'Cleaning', count: 45, revenue: 22500 },
    { service: 'Filling', count: 38, revenue: 30400 },
    { service: 'Extraction', count: 25, revenue: 37500 },
    { service: 'Root Canal', count: 15, revenue: 45000 },
    { service: 'Crown', count: 12, revenue: 48000 }
  ];

  // Payment status data
  const paymentStatus: PaymentStatus[] = [
    { status: 'Paid', count: 142, percentage: 85 },
    { status: 'Pending', count: 18, percentage: 11 },
    { status: 'Overdue', count: 7, percentage: 4 }
  ];

  // Metric cards data
  const metricCards = [
    {
      title: 'Total Dentists',
      value: dashboardData.totalDentists,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Total Patients',
      value: dashboardData.totalPatients,
      icon: UserCheck,
      color: 'text-green-500'
    },
    {
      title: 'Receptionists',
      value: dashboardData.totalReceptionists,
      icon: Activity,
      color: 'text-purple-500'
    },
    {
      title: 'Total Appointments',
      value: dashboardData.totalAppointments,
      icon: Calendar,
      color: 'text-orange-500'
    },
    {
      title: 'Monthly Revenue',
      value: `$${dashboardData.monthlyRevenue.toLocaleString()}`,
      icon: CreditCard,
      color: 'text-green-600'
    },
   /* {
      title: 'Pending',
      value: dashboardData.pendingAppointments,
      icon: TrendingUp,
      color: 'text-yellow-500'
    }*/
  ];

  // Initialize charts
  useEffect(() => {
    // Pie Chart
    if (pieChartRef.current) {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
      
      const ctx = pieChartRef.current.getContext('2d');
      if (ctx) {
        pieChartInstance.current = new Chart.Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: appointmentStatus.map(item => item.name),
            datasets: [{
              data: appointmentStatus.map(item => item.value),
              backgroundColor: appointmentStatus.map(item => item.color),
              borderWidth: 2,
              borderColor: '#ffffff',
              hoverBorderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'white',
                titleColor: '#374151',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.parsed} appointments`;
                  }
                }
              }
            },
            animation: {
              animateRotate: true,
              duration: 1000
            }
          }
        });
      }
    }

    // Line Chart
    if (lineChartRef.current) {
      if (lineChartInstance.current) {
        lineChartInstance.current.destroy();
      }
      
      const ctx = lineChartRef.current.getContext('2d');
      if (ctx) {
        lineChartInstance.current = new Chart.Chart(ctx, {
          type: 'line',
          data: {
            labels: paymentTrends.map(item => item.month),
            datasets: [{
              label: 'Revenue',
              data: paymentTrends.map(item => item.revenue),
              borderColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#3B82F6',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              fill: true,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'white',
                titleColor: '#374151',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  label: function(context) {
                    return `Revenue: $${context.parsed.y.toLocaleString()}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: '#f0f0f0',
                  drawBorder: false
                },
                ticks: {
                  color: '#666666',
                  font: { size: 12 }
                }
              },
              y: {
                grid: {
                  color: '#f0f0f0',
                  drawBorder: false
                },
                ticks: {
                  color: '#666666',
                  font: { size: 12 },
                  callback: function(value) {
                    return '$' + (Number(value) / 1000).toFixed(0) + 'k';
                  }
                }
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart'
            }
          }
        });
      }
    }

    // Bar Chart
    if (barChartRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
      
      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        barChartInstance.current = new Chart.Chart(ctx, {
          type: 'bar',
          data: {
            labels: serviceTypes.map(item => item.service),
            datasets: [{
              label: 'Appointments',
              data: serviceTypes.map(item => item.count),
              backgroundColor: '#8B5CF6',
              borderColor: '#7C3AED',
              borderWidth: 1,
              borderRadius: 4,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'white',
                titleColor: '#374151',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                  afterLabel: function(context) {
                    const serviceIndex = context.dataIndex;
                    const revenue = serviceTypes[serviceIndex].revenue;
                    return `Revenue: $${revenue.toLocaleString()}`;
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  color: '#f0f0f0',
                  drawBorder: false
                },
                ticks: {
                  color: '#666666',
                  font: { size: 12 }
                }
              },
              y: {
                grid: {
                  color: '#f0f0f0',
                  drawBorder: false
                },
                ticks: {
                  color: '#666666',
                  font: { size: 12 }
                }
              }
            },
            animation: {
              duration: 1500,
              easing: 'easeOutQuart'
            }
          }
        });
      }
    }

    // Cleanup function
    return () => {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (lineChartInstance.current) lineChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl mt-6 md:mt-0 font-bold tracking-tight text-gray-900">
              Dental Clinic Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back! Here's what's happening with your appointment system.
            </p>
          </div>
          
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {metricCards.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      {metric.title}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {metric.value}
                    </p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${metric.color}`} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Appointment Status Analytics */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Appointment Status</CardTitle>
                  <CardDescription className="mt-1">
                    Distribution of appointment statuses
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <Badge variant="secondary" className="text-xs">
                    Live Data
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6 flex items-center justify-center">
                <canvas ref={pieChartRef} className="max-w-full max-h-full"></canvas>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {appointmentStatus.map((status, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {status.name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {status.value} appointments
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Side - Payment Analysis */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Payment Analysis</CardTitle>
                  <CardDescription className="mt-1">
                    Monthly revenue trends and payment status
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                    +12% vs last month
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 mb-6">
                <canvas ref={lineChartRef} className="w-full h-full"></canvas>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {paymentStatus.map((status, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="text-sm font-medium text-gray-600">
                      {status.status}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {status.count}
                    </p>
                    <Badge 
                      variant="secondary" 
                      className="mt-2 text-xs"
                    >
                      {status.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        
      </div>
    </div>
  );
};

export default DentalDashboard;