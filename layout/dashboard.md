<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Professional Inventory Dashboard</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdn.tailwindcss.com?plugins=forms,typography"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        primary: "#2E7D32", // Leaf Green
                        secondary: "#37474F", // Deep Slate Blue/Grey
                        "background-light": "#F3F4F6", // Light gray/white background
                        "background-dark": "#111827", // Dark gray background
                        "surface-light": "#FFFFFF",
                        "surface-dark": "#1F2937",
                        "accent-blue": "#1976D2",
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Inter', 'sans-serif'],
                    },
                    borderRadius: {
                        DEFAULT: "0.5rem",
                    },
                },
            },
        };
    </script>
<style>::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
        .dark ::-webkit-scrollbar-thumb {
            background: #4b5563;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-secondary dark:text-gray-200 font-sans transition-colors duration-200">
<header class="bg-white dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
<div class="px-4 sm:px-6 lg:px-8">
<div class="flex items-center justify-between h-16">
<div class="flex items-center gap-3">
<div class="bg-primary/10 p-2 rounded-lg">
<span class="material-icons-round text-primary text-2xl">eco</span>
</div>
<span class="font-bold text-xl tracking-tight text-gray-900 dark:text-white">EcoTrack <span class="text-primary font-normal">IMS</span></span>
</div>
<div class="flex items-center gap-4">
<button class="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
<span class="sr-only">Notifications</span>
<span class="material-icons-round">notifications_none</span>
</button>
<div class="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm cursor-pointer shadow-md">
                        JD
                    </div>
</div>
</div>
</div>
</header>
<div class="flex h-[calc(100vh-64px)] overflow-hidden">
<aside class="w-64 bg-white dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col flex-shrink-0">
<nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
<a class="bg-primary/10 text-primary group flex items-center px-3 py-2.5 text-sm font-medium rounded-md" href="#">
<span class="material-icons-round mr-3 text-lg">dashboard</span>
                    Dashboard
                </a>
<div class="pt-4 pb-2">
<p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Inventory</p>
</div>
<a class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors" href="#">
<span class="material-icons-round mr-3 text-lg text-gray-400 group-hover:text-gray-500">inventory_2</span>
                    All Products
                </a>
<a class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors" href="#">
<span class="material-icons-round mr-3 text-lg text-gray-400 group-hover:text-gray-500">category</span>
                    Categories
                </a>
<a class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors" href="#">
<span class="material-icons-round mr-3 text-lg text-gray-400 group-hover:text-gray-500">warehouse</span>
                    Warehouses
                </a>
<div class="pt-4 pb-2">
<p class="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Reports</p>
</div>
<a class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors" href="#">
<span class="material-icons-round mr-3 text-lg text-gray-400 group-hover:text-gray-500">bar_chart</span>
                    Stock Levels
                </a>
<a class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors" href="#">
<span class="material-icons-round mr-3 text-lg text-gray-400 group-hover:text-gray-500">trending_up</span>
                    Sales Trends
                </a>
</nav>
<div class="p-4 border-t border-gray-200 dark:border-gray-700">
<a class="text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors" href="#">
<span class="material-icons-round mr-3 text-lg text-gray-400 group-hover:text-gray-500">settings</span>
                    Settings
                </a>
</div>
</aside>
<main class="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark p-6 lg:p-8">
<div class="max-w-7xl mx-auto space-y-8">
<div class="md:flex md:items-center md:justify-between">
<div class="flex-1 min-w-0">
<h2 class="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                            Dashboard
                        </h2>
<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of inventory performance and stock levels.</p>
</div>
<div class="mt-4 flex md:mt-0 md:ml-4">
<button class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary" type="button">
<span class="material-icons-round text-sm mr-2">add</span>
                            Add Product
                        </button>
</div>
</div>
<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
<div class="bg-white dark:bg-surface-dark overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
<div class="p-5">
<div class="flex items-center">
<div class="flex-shrink-0">
<div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-accent-blue">
<span class="material-icons-round">category</span>
</div>
</div>
<div class="ml-5 w-0 flex-1">
<dl>
<dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Products</dt>
<dd>
<div class="text-2xl font-semibold text-gray-900 dark:text-white">5</div>
</dd>
</dl>
</div>
</div>
</div>
</div>
<div class="bg-white dark:bg-surface-dark overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
<div class="p-5">
<div class="flex items-center">
<div class="flex-shrink-0">
<div class="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
<span class="material-icons-round">warehouse</span>
</div>
</div>
<div class="ml-5 w-0 flex-1">
<dl>
<dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Warehouses</dt>
<dd>
<div class="text-2xl font-semibold text-gray-900 dark:text-white">3</div>
</dd>
</dl>
</div>
</div>
</div>
</div>
<div class="bg-white dark:bg-surface-dark overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
<div class="p-5">
<div class="flex items-center">
<div class="flex-shrink-0">
<div class="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-primary">
<span class="material-icons-round">payments</span>
</div>
</div>
<div class="ml-5 w-0 flex-1">
<dl>
<dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Inventory Value</dt>
<dd>
<div class="text-2xl font-semibold text-gray-900 dark:text-white">$5,377.50</div>
</dd>
</dl>
</div>
</div>
</div>
</div>
<div class="bg-white dark:bg-surface-dark overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
<div class="p-5">
<div class="flex items-center">
<div class="flex-shrink-0">
<div class="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
<span class="material-icons-round">warning_amber</span>
</div>
</div>
<div class="ml-5 w-0 flex-1">
<dl>
<dt class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Low Stock Alerts</dt>
<dd>
<div class="text-2xl font-semibold text-gray-900 dark:text-white">2</div>
</dd>
</dl>
</div>
</div>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
<div class="bg-white dark:bg-surface-dark p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
<h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Stock by Category</h3>
<div class="relative h-64 w-full">
<canvas id="stockBarChart"></canvas>
</div>
</div>
<div class="bg-white dark:bg-surface-dark p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
<h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Inventory Value Trends</h3>
<div class="relative h-64 w-full">
<canvas id="valueLineChart"></canvas>
</div>
</div>
</div>
<div class="bg-white dark:bg-surface-dark shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
<div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
<h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white">Inventory Overview</h3>
<div class="flex gap-2">
<input class="text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white py-1.5" placeholder="Search SKU or Name..." type="text"/>
<button class="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
<span class="material-icons-round text-sm mr-1">filter_list</span> Filter
                             </button>
</div>
</div>
<div class="overflow-x-auto">
<table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
<thead class="bg-gray-50 dark:bg-gray-800">
<tr>
<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">SKU</th>
<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Product Name</th>
<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Category</th>
<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Total Stock</th>
<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Reorder Point</th>
<th class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Status</th>
<th class="relative px-6 py-3" scope="col">
<span class="sr-only">Edit</span>
</th>
</tr>
</thead>
<tbody class="bg-white dark:bg-surface-dark divide-y divide-gray-200 dark:divide-gray-700">
<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">ECO-UTN-001</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Bamboo Spork Set</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Utensils</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">400</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">100</td>
<td class="px-6 py-4 whitespace-nowrap text-center">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                            In Stock
                                        </span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
<a class="text-primary hover:text-green-900 dark:hover:text-green-400" href="#">Edit</a>
</td>
</tr>
<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">ECO-PKG-002</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Compostable Food Container 32oz</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Packaging</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">2000</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">500</td>
<td class="px-6 py-4 whitespace-nowrap text-center">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                            In Stock
                                        </span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
<a class="text-primary hover:text-green-900 dark:hover:text-green-400" href="#">Edit</a>
</td>
</tr>
<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">ECO-UTN-003</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Wooden Chopsticks</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Utensils</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">4300</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">1000</td>
<td class="px-6 py-4 whitespace-nowrap text-center">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                            In Stock
                                        </span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
<a class="text-primary hover:text-green-900 dark:hover:text-green-400" href="#">Edit</a>
</td>
</tr>
<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">ECO-PKG-004</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Recyclable Paper Bowl</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Packaging</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 text-right">1550</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">750</td>
<td class="px-6 py-4 whitespace-nowrap text-center">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                            In Stock
                                        </span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
<a class="text-primary hover:text-green-900 dark:hover:text-green-400" href="#">Edit</a>
</td>
</tr>
<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
<td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">ECO-CUP-005</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Biodegradable Coffee Cup 12oz</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">Cups</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-semibold text-right">115</td>
<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">600</td>
<td class="px-6 py-4 whitespace-nowrap text-center">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                            Low Stock
                                        </span>
</td>
<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
<a class="text-primary hover:text-green-900 dark:hover:text-green-400" href="#">Edit</a>
</td>
</tr>
</tbody>
</table>
</div>
<div class="bg-white dark:bg-surface-dark px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
<div class="flex items-center justify-between sm:hidden">
<a class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" href="#">Previous</a>
<a class="relative inline-flex items-center px-4 py-2 ml-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50" href="#">Next</a>
</div>
<div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
<div>
<p class="text-sm text-gray-700 dark:text-gray-400">
                              Showing <span class="font-medium">1</span> to <span class="font-medium">5</span> of <span class="font-medium">28</span> results
                            </p>
</div>
<div>
<nav aria-label="Pagination" class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
<a class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" href="#">
<span class="sr-only">Previous</span>
<span class="material-icons-round text-sm">chevron_left</span>
</a>
<a aria-current="page" class="z-10 bg-primary/10 border-primary text-primary relative inline-flex items-center px-4 py-2 border text-sm font-medium" href="#">1</a>
<a class="bg-white dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium" href="#">2</a>
<a class="bg-white dark:bg-surface-dark border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 relative inline-flex items-center px-4 py-2 border text-sm font-medium" href="#">3</a>
<a class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-surface-dark text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700" href="#">
<span class="sr-only">Next</span>
<span class="material-icons-round text-sm">chevron_right</span>
</a>
</nav>
</div>
</div>
</div>
</div>
</div>
</main>
</div>
<script>
        // Check for dark mode preference
        const isDarkMode = document.documentElement.classList.contains('dark') || 
                           window.matchMedia('(prefers-color-scheme: dark)').matches;
        const chartTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
        const chartGridColor = isDarkMode ? '#374151' : '#E5E7EB';
        // Bar Chart
        const ctxBar = document.getElementById('stockBarChart').getContext('2d');
        new Chart(ctxBar, {
            type: 'bar',
            data: {
                labels: ['Utensils', 'Packaging', 'Cups', 'Bags', 'Napkins'],
                datasets: [{
                    label: 'Current Stock',
                    data: [4700, 3550, 1150, 2100, 890],
                    backgroundColor: [
                        'rgba(46, 125, 50, 0.7)', // Primary green
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)',
                        'rgba(46, 125, 50, 0.7)',
                    ],
                    borderColor: '#2E7D32',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: chartGridColor
                        },
                        ticks: {
                            color: chartTextColor
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: chartTextColor
                        }
                    }
                }
            }
        });
        // Line Chart
        const ctxLine = document.getElementById('valueLineChart').getContext('2d');
        new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Inventory Value ($)',
                    data: [4200, 4800, 4500, 5100, 5377, 5900],
                    backgroundColor: 'rgba(25, 118, 210, 0.1)', // Light blue fill
                    borderColor: '#1976D2', // Accent Blue
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: chartGridColor
                        },
                        ticks: {
                            color: chartTextColor,
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: chartTextColor
                        }
                    }
                }
            }
        });
    </script>

</body></html>
