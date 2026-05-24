
(function ($) {
	"use strict";
	var windowOn = $(window);

	/* working hour chart */
	if (jQuery("#workingHourWeek").length > 0) {

		var options = {
			series: [{
				name: 'Work',
				data: [7.7, 8, 6, 7.85, 7, 8]
			},
			{
				name: 'Bark',
				data: [-.3, -0, -3, -.15, -1, -0.2]
			}
			],
			chart: {
				type: 'bar',
				height: 320,
				stacked: true,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true,
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-action-danger)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				width: 1,
			},
			grid: {
				xaxis: {
					lines: {
						show: false
					}
				}
			},
			yaxis: {
				min: -3,
				max: 8,
			},
			tooltip: {
				shared: false,
				x: {
					formatter: function (val) {
						return val
					}
				},
				y: {
					formatter: function (val) {
						return Math.abs(val) + "Hour"
					}
				}
			},
			xaxis: {
				categories: ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th'
				],
			},
			legend: {
				show: true,
				position: 'top',
				horizontalAlign: 'start',
				offsetX: -5,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};
		var chart = new ApexCharts(document.querySelector("#workingHourWeek"), options);
		chart.render();
	}
	if (jQuery("#workingHourMonth").length > 0) {
		var options = {
			series: [{
				name: 'Work',
				data: [7.7, 8, 6, 7.85, 7, 8, 7.7, 8, 6, 7.85, 7, 8, 7.7, 8, 6, 7.85, 7, 8, 7.7, 8,]
			},
			{
				name: 'Bark',
				data: [-.3, -0, -3, -.15, -1, -0.2, -.3, -0, -3, -.15, -1, -0.2, -.3, -0, -3, -.15, -1, -0.2, -.3, -0,]
			}
			],
			chart: {
				type: 'bar',
				height: 320,
				stacked: true,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true,
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-action-danger)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				width: 1,
			},
			grid: {
				xaxis: {
					lines: {
						show: false
					}
				}
			},
			yaxis: {
				min: -3,
				max: 8,
			},
			tooltip: {
				shared: false,
				x: {
					formatter: function (val) {
						return val
					}
				},
				y: {
					formatter: function (val) {
						return Math.abs(val) + "Hour"
					}
				}
			},
			xaxis: {
				categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
			},
			legend: {
				show: true,
				position: 'top',
				horizontalAlign: 'start',
				offsetX: -5,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};
		var chart = new ApexCharts(document.querySelector("#workingHourMonth"), options);
		chart.render();
	}
	if (jQuery("#workingHourYear").length > 0) {
		var options = {
			series: [{
				name: 'Work',
				data: [7.7, 8, 6, 7.85, 7, 8, 7.7, 8, 6, 7.85, 7, 8]
			},
			{
				name: 'Bark',
				data: [-.3, -0, -3, -.15, -1, -0.2, -.3, -0, -3, -.15, -1, -0.2]
			}
			],
			chart: {
				type: 'bar',
				height: 320,
				stacked: true,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-action-danger)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				width: 1,
			},
			grid: {
				xaxis: {
					lines: {
						show: false
					}
				}
			},
			yaxis: {
				min: -5,
				max: 8,
			},
			tooltip: {
				shared: false,
				x: {
					formatter: function (val) {
						return val
					}
				},
				y: {
					formatter: function (val) {
						return Math.abs(val) + "Hour"
					}
				}
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
			},
			legend: {
				show: true,
				position: 'top',
				horizontalAlign: 'start',
				offsetX: -5,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};
		var chart = new ApexCharts(document.querySelector("#workingHourYear"), options);
		chart.render();
	}
	/* Line Chat */
	/* lineChart weekly */
	if (jQuery("#lineChartWeek").length > 0) {
		var options = {
			series: [{
				name: 'sale',
				data: [35, 45, 28, 61, 62, 80, 90]
			}, {
				name: 'series2',
				data: [25, 32, 35, 55, 50, 70, 101]
			}],
			chart: {
				height: 283,
				offsetX: 0,
				type: 'area',
				// offsetY: 2,
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false
				},
			},
			colors: ['#6C5FFC', '#05C3FB'],
			fill: {
				opacity: 1
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'smooth'
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {

				show: true,
				labels: {
					offsetX: -10,
					formatter: function (value) {
						return value + "k";
					},
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				show: false,
			},
		};
		var chart = new ApexCharts(document.querySelector("#lineChartWeek"), options);
		chart.render();
	}
	/* line Chart Monthly */
	if (jQuery("#lineChartMonth").length > 0) {
		var options = {
			series: [{
				name: 'sale',
				data: [35, 45, 28, 61, 62, 80, 90]
			}, {
				name: 'series2',
				data: [25, 32, 35, 55, 50, 70, 101]
			}],
			chart: {
				height: 283,
				offsetX: 0,
				type: 'area',
				// offsetY: 2,
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false
				},
			},
			colors: ['#6C5FFC', '#05C3FB'],
			fill: {
				opacity: 1
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'smooth'
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {

				show: true,
				labels: {
					offsetX: -10,
					formatter: function (value) {
						return value + "k";
					},
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				show: false,
			},
		};
		var chart = new ApexCharts(document.querySelector("#lineChartMonth"), options);
		chart.render();
	}
	/* line Chart Year */
	if (jQuery("#lineChartYear").length > 0) {
		var options = {
			series: [{
				name: 'sale',
				data: [50, 40, 38, 61, 82, 109, 100]
			}, {
				name: 'series2',
				data: [40, 50, 65, 32, 70, 90, 80]
			}],
			chart: {
				height: 283,
				offsetX: 0,
				type: 'area',
				// offsetY: 2,
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false
				},
			},
			colors: ['#6C5FFC', '#05C3FB'],
			fill: {
				opacity: 1
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'smooth'
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {

				show: true,
				labels: {
					offsetX: -10,
					formatter: function (value) {
						return value + "k";
					},
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				show: false,
			},
		};
		var chart = new ApexCharts(document.querySelector("#lineChartYear"), options);
		chart.render();
	}
	/* Pie Chart */
	if (jQuery("#pieChartAud").length > 0) {
		var options = {
			series: [25, 75],
			labels: ['Subscriber', 'New User',],
			chart: {
				type: 'donut',
				width: '100%',
				height: 243
			},
			colors: ['var(--clr-theme-secondary)', 'var(--clr-theme-primary)',],
			legend: {
				show: false,
				position: 'center'
			},
			plotOptions: {
				pie: {
					size: 150,
					donut: {
						position: 'center',
						labels: {
							show: true,
							name: {
								show: true,
								fontSize: "18px",
								color: "var(--clr-action-success)",
								offsetY: 5,
							},
							value: {
								show: false,
								fontSize: "16px",
								color: "var(--clr-action-success)",
								offsetY: 16,
								formatter: function (val) {
									return val;
								}
							},
							total: {
								show: true,
								label: "Overview",
								color: "var(--clr-action-success)",
								fontSize: "20px",
								offsetY: 50,
								formatter: function (w) {
									return w.globals.seriesTotals.reduce((a, b) => {
										return a + b;
									}, 0);
								}
							}
						}
					}
				}
			},
			tooltip: {
				enabled: true,
				y: {
					formatter: function (val) {
						return val + "" + "%";
					},
					color: "var(--clr-action-success)",
				}
			},
			dataLabels: {
				enabled: false,
				formatter: function (val) {
					return val + "M"
				},
				color: "var(--clr-action-success)",
			},
			stroke: {
				width: 0,
			},
		};

		var chart = new ApexCharts(document.querySelector("#pieChartAud"), options);
		chart.render();
	}
	/* Sales Chart Weekly */
	if (jQuery("#salesChartWeek").length > 0) {
		var options = {
			series: [{
				name: 'Sale',
				data: [76, 85, 101, 98, 87, 105, 91]
			}, {
				name: 'Profit',
				data: [44, 55, 57, 56, 61, 58, 63]
			}],
			chart: {
				type: 'bar',
				height: 315,
				toolbar: {
					show: true,
					offsetX: 0,
					offsetY: 0,
				},
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					endingShape: 'rounded'
				},
			},
			dataLabels: {
				enabled: false
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			xaxis: {
				categories: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands"
					}
				}
			}
		};
		var chart = new ApexCharts(document.querySelector("#salesChartWeek"), options);
		chart.render();
	}
	/* Sales Chart Monthly */
	if (jQuery("#salesChartMonthly").length > 0) {
		var options = {
			series: [{
				name: 'Sale',
				data: [76, 85, 101, 98, 87, 105, 91]
			}, {
				name: 'Profit',
				data: [44, 55, 57, 56, 61, 58, 63]
			}],
			chart: {
				type: 'bar',
				height: 315,
				width: 620,
				offsetX: -20,
				toolbar: {
					show: true,
					offsetX: -22,
					offsetY: 0,
				},
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					endingShape: 'rounded'
				},
			},
			dataLabels: {
				enabled: false
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			xaxis: {
				categories: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands"
					}
				}
			}
		};
		var chart = new ApexCharts(document.querySelector("#salesChartMonthly"), options);
		chart.render();
	};
	/* Sales Chart Yearly */
	if (jQuery("#salesChartYearly").length > 0) {
		var options = {
			series: [{
				name: 'Sale',
				data: [76, 85, 101, 98, 87, 105, 91]
			}, {
				name: 'Profit',
				data: [44, 55, 57, 56, 61, 58, 63]
			}],
			chart: {
				type: 'bar',
				height: 315,
				width: 620,
				offsetX: -20,
				toolbar: {
					show: true,
					offsetX: -22,
					offsetY: 0,
				},
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					endingShape: 'rounded'
				},
			},
			dataLabels: {
				enabled: false
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			xaxis: {
				categories: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands"
					}
				}
			}
		};
		var chart = new ApexCharts(document.querySelector("#salesChartYearly"), options);
		chart.render();
	};
	/* Revenue Chart */
	if (jQuery("#revenueChartWeek2").length > 0) {
		var options = {
			series: [{
				name: 'Order Today',
				data: [90, 95, 70, 80, 90, 100, 110]
			}, {
				name: 'Earning Today',
				data: [80, 90, 80, 70, 80, 90, 100]
			}, {
				name: 'Revenue Today',
				data: [90, 80, 80, 75, 95, 80, 90]
			}],
			chart: {
				type: 'bar',
				height: 290,
				width: '100%',
				toolbar: {
					show: true,
					tools: {
						download: false,
					}
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)'],
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					endingShape: 'rounded'
				},
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},
			xaxis: {
				categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands"
					}
				}
			},
			legend: {
				show: false,
			},
			yaxis: {
				tooltip: {
					enabled: true,
				},
				labels: {
					style: {
						colors: ["var(--clr-chart-1)"],
						fontWeight: 400,
						fontSize: '12px',
						fontFamily: "'Manrope', sans-serif",
					},
					offsetX: 0,
					offsetY: 0,
				},
			},
		};
		var chart = new ApexCharts(document.querySelector("#revenueChartWeek2"), options);
		chart.render();
	}
	if (jQuery("#revenueChartMonth2").length > 0) {
		var options = {
			series: [{
				name: 'Order Today',
				data: [80, 100, 90, 70, 100, 90, 85, 70, 95, 70, 100, 90, 85, 70, 95]
			}, {
				name: 'Earning Today',
				data: [70, 90, 80, 60, 80, 100, 91, 84, 90, 60, 80, 100, 91, 84, 90]
			}, {
				name: 'Revenue Today',
				data: [90, 80, 70, 90, 90, 95, 82, 93, 101, 90, 90, 95, 82, 93, 101]
			}],
			chart: {
				type: 'bar',
				height: 290,
				width: '100%',
				toolbar: {
					show: true,
					tools: {
						download: false,
					}
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)'],
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					endingShape: 'rounded'
				},
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},
			xaxis: {
				categories: ['02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22', '24', '26', '28', '30',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands"
					}
				}
			},
			legend: {
				show: false,
			},
			yaxis: {
				tooltip: {
					enabled: true,
				},
				labels: {
					style: {
						colors: ["var(--clr-chart-1)"],
						fontWeight: 400,
						fontSize: '12px',
						fontFamily: "'Manrope', sans-serif",
					},
					offsetX: 0,
					offsetY: 0,
				},
			},
		};
		var chart = new ApexCharts(document.querySelector("#revenueChartMonth2"), options);
		chart.render();
	}
	if (jQuery("#revenueChartYear2").length > 0) {
		var options = {
			series: [{
				name: 'Order Today',
				data: [80, 55, 57, 56, 61, 58, 63, 60, 66, 78, 80, 95]
			}, {
				name: 'Earning Today',
				data: [70, 85, 90, 98, 87, 95, 91, 80, 94, 80, 75, 90]
			}, {
				name: 'Revenue Today',
				data: [45, 51, 66, 76, 45, 98, 82, 63, 71, 65, 70, 80]
			}],
			chart: {
				type: 'bar',
				height: 290,
				width: '100%',
				toolbar: {
					show: true,
					tools: {
						download: false,
					}
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)'],
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					endingShape: 'rounded'
				},
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands"
					}
				}
			},
			legend: {
				show: false,
			},
			yaxis: {
				tooltip: {
					enabled: true,
				},
				labels: {
					style: {
						colors: ["var(--clr-chart-1)"],
						fontWeight: 400,
						fontSize: '12px',
						fontFamily: "'Manrope', sans-serif",
					},
					offsetX: 0,
					offsetY: 0,
				},
			},
		};
		var chart = new ApexCharts(document.querySelector("#revenueChartYear2"), options);
		chart.render();
	}

	/* All ApexCharts */
	/* lineCharts */
	if (jQuery("#lineCharts").length > 0) {
		var options = {
			series: [{
				name: "Desktops",
				data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
			}],
			chart: {
				height: 350,
				type: 'line',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false
				}
			},
			colors: ['var(--clr-chart-1)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'straight'
			},
			grid: {
				row: {
					show: true,
					borderColor: '#E6E6E6',
				},
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				show: false,
			},
		};

		var chart = new ApexCharts(document.querySelector("#lineCharts"), options);
		chart.render();
	}
	if (jQuery("#lineCharts2").length > 0) {
		var options = {
			series: [
				{
					name: "High - 2013",
					data: [28, 29, 33, 36, 32, 32, 33]
				},
				{
					name: "Low - 2013",
					data: [12, 11, 14, 18, 17, 13, 13]
				}
			],
			chart: {
				height: 350,
				type: 'line',
				foreColor: 'var(--clr-chart-1)',
				dropShadow: {
					enabled: true,
					color: 'var(--clr-action-success)',
					top: 18,
					left: 7,
					blur: 10,
					opacity: 0.2
				},
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-chart-1)', '#05C3FB'],
			dataLabels: {
				enabled: true,
			},
			stroke: {
				curve: 'smooth'
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
			markers: {
				size: 1
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
				title: {
					text: 'Month',
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				title: {
					text: 'Temperature',
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
				min: 5,
				max: 40,
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				position: 'top',
				horizontalAlign: 'right',
				floating: true,
				offsetY: -25,
				offsetX: -5,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};
		var chart = new ApexCharts(document.querySelector("#lineCharts2"), options);
		chart.render();

	}
	if (jQuery("#lineCharts3").length > 0) {
		var options = {
			series: [{
				data: [34, 44, 54, 21, 12, 43, 33, 23, 66, 66, 58]
			}],
			chart: {
				type: 'line',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			stroke: {
				curve: 'stepline',
			},
			dataLabels: {
				enabled: false
			},
			colors: ['var(--clr-chart-1)'],
			markers: {
				hover: {
					sizeOffset: 4
				}
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
		};

		var chart = new ApexCharts(document.querySelector("#lineCharts3"), options);
		chart.render();

	}
	if (jQuery("#lineCharts4").length > 0) {
		var options = {
			series: [{
				name: 'Sales',
				data: [4, 3, 10, 9, 29, 19, 22, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 5]
			}],
			chart: {
				height: 350,
				type: 'line',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				},
			},
			forecastDataPoints: {
				count: 7
			},
			stroke: {
				width: 5,
				curve: 'smooth'
			},
			xaxis: {
				type: 'datetime',
				categories: ['1/11/2000', '2/11/2000', '3/11/2000', '4/11/2000', '5/11/2000', '6/11/2000', '7/11/2000', '8/11/2000', '9/11/2000', '10/11/2000', '11/11/2000', '12/11/2000', '1/11/2001', '2/11/2001', '3/11/2001', '4/11/2001', '5/11/2001', '6/11/2001'],
				tickAmount: 10,
				labels: {
					formatter: function (value, timestamp, opts) {
						return opts.dateFormatter(new Date(timestamp), 'dd MMM')
					},
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				}
			},
			fill: {
				type: 'gradient',
				gradient: {
					shade: 'dark',
					gradientToColors: ['var(--clr-chart-1)'],
					shadeIntensity: 1,
					type: 'horizontal',
					opacityFrom: 1,
					opacityTo: 1,
					stops: [0, 100, 100, 100]
				},
			},
			yaxis: {
				min: -10,
				max: 40,
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#lineCharts4"), options);
		chart.render();
	}
	if (jQuery("#lineCharts5").length > 0) {
		var options = {
			series: [{
				name: 'Peter',
				data: [5, 5, 10, 8, 7, 5, 4, null, null, null, 10, 10, 7, 8, 6, 9]
			}, {
				name: 'Johnny',
				data: [10, 15, null, 12, null, 10, 12, 15, null, null, 12, null, 14, null, null, null]
			}, {
				name: 'David',
				data: [null, null, null, null, 3, 4, 1, 3, 4, 6, 7, 9, 5, null, null, null]
			}],
			chart: {
				height: 350,
				type: 'line',
				foreColor: 'var(--clr-chart-1)',
				zoom: {
					enabled: false
				},
				animations: {
					enabled: false
				},
				toolbar: {
					show: false,
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)'],
			stroke: {
				width: [5, 5, 4],
				curve: 'straight'
			},
			labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
			xaxis: {
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
		};

		var chart = new ApexCharts(document.querySelector("#lineCharts5"), options);
		chart.render();

	}
	if (jQuery("#lineCharts6").length > 0) {
		var options = {
			series: [{
				name: "Session Duration",
				data: [45, 52, 38, 24, 33, 26, 21, 20, 6, 8, 15, 10]
			},
			{
				name: "Page Views",
				data: [35, 41, 62, 42, 13, 18, 29, 37, 36, 51, 32, 35]
			},
			{
				name: 'Total Visits',
				data: [87, 50, 60, 80, 65, 38, 62, 47, 42, 66, 45, 47]
			}
			],
			chart: {
				height: 350,
				type: 'line',
				foreColor: 'var(--clr-chart-1)',
				zoom: {
					enabled: false
				},
				toolbar: {
					show: false,
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				width: [5, 7, 5],
				curve: 'straight',
				dashArray: [0, 8, 5]
			},
			legend: {
				tooltipHoverFormatter: function (val, opts) {
					return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
				},
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			markers: {
				size: 0,
				hover: {
					sizeOffset: 6
				}
			},
			xaxis: {
				categories: ['01 Jan', '02 Jan', '03 Jan', '04 Jan', '05 Jan', '06 Jan', '07 Jan', '08 Jan', '09 Jan',
					'10 Jan', '11 Jan', '12 Jan'
				],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				show: true,
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			tooltip: {
				y: [
					{
						title: {
							formatter: function (val) {
								return val + " (mins)"
							}
						}
					},
					{
						title: {
							formatter: function (val) {
								return val + " per session"
							}
						}
					},
					{
						title: {
							formatter: function (val) {
								return val;
							}
						}
					}
				]
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
		};

		var chart = new ApexCharts(document.querySelector("#lineCharts6"), options);
		chart.render();
	}
	/* Area Chart */
	if (jQuery("#areaCharts").length > 0) {
		var options = {
			series: [{
				name: 'Net Profit',
				data: [30, 60, 35, 110, 45, 70, 60, 100]
			}],
			chart: {
				height: 305,
				type: 'area',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false
				},
			},
			colors: ['var(--clr-chart-1)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'straight'
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				show: true,
				labels: {
					offsetX: -10,
					formatter: function (value) {
						return value + "k";
					},
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				show: false,
			},
			fill: {
				type: "gradient",
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.5,
					opacityTo: 0.5,
					stops: [0, 90, 100]
				}
			},
		};

		var chart = new ApexCharts(document.querySelector("#areaCharts"), options);
		chart.render();
	}
	if (jQuery("#areaCharts2").length > 0) {
		var options = {
			series: [{
				name: 'Net Profit',
				data: [30, 60, 35, 110, 45, 70, 60, 100]
			}, {
				name: 'Revenue',
				data: [65, 40, 80, 50, 100, 25, 85, 55]
			},],
			chart: {
				height: 305,
				type: 'area',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false
				},
			},
			colors: ['var(--clr-chart-1)', '#05C3FB'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'smooth'
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				show: true,
				labels: {
					offsetX: -10,
					formatter: function (value) {
						return value + "k";
					},
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				show: false,
			},
			fill: {
				type: "gradient",
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.5,
					opacityTo: 0.5,
					stops: [0, 90, 100]
				}
			},
		};

		var chart = new ApexCharts(document.querySelector("#areaCharts2"), options);
		chart.render();
	}
	if (jQuery("#areaCharts3").length > 0) {

		var options = {
			series: [{
				name: 'north',
				data: [{
					x: 1996,
					y: 322
				},
				{
					x: 1997,
					y: 324
				},
				{
					x: 1998,
					y: 329
				},
				{
					x: 1999,
					y: 342
				},
				{
					x: 2000,
					y: 348
				},
				{
					x: 2001,
					y: 334
				},
				{
					x: 2002,
					y: 325
				},
				{
					x: 2003,
					y: 316
				},
				{
					x: 2004,
					y: 318
				},
				{
					x: 2005,
					y: 330
				},
				{
					x: 2006,
					y: 355
				},
				{
					x: 2007,
					y: 366
				},
				{
					x: 2008,
					y: 337
				},
				{
					x: 2009,
					y: 352
				},
				{
					x: 2010,
					y: 377
				},
				{
					x: 2011,
					y: 383
				},
				{
					x: 2012,
					y: 344
				},
				{
					x: 2013,
					y: 366
				},
				{
					x: 2014,
					y: 389
				},
				{
					x: 2015,
					y: 334
				}
				]
			}, {
				name: 'south',
				data: [
					{
						x: 1996,
						y: 162
					},
					{
						x: 1997,
						y: 90
					},
					{
						x: 1998,
						y: 50
					},
					{
						x: 1999,
						y: 77
					},
					{
						x: 2000,
						y: 35
					},
					{
						x: 2001,
						y: -45
					},
					{
						x: 2002,
						y: -88
					},
					{
						x: 2003,
						y: -120
					},
					{
						x: 2004,
						y: -156
					},
					{
						x: 2005,
						y: -123
					},
					{
						x: 2006,
						y: -88
					},
					{
						x: 2007,
						y: -66
					},
					{
						x: 2008,
						y: -45
					},
					{
						x: 2009,
						y: -29
					},
					{
						x: 2010,
						y: -45
					},
					{
						x: 2011,
						y: -88
					},
					{
						x: 2012,
						y: -132
					},
					{
						x: 2013,
						y: -146
					},
					{
						x: 2014,
						y: -169
					},
					{
						x: 2015,
						y: -184
					}
				]
			}],
			chart: {
				type: 'area',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				},
			},
			colors: ['var(--clr-chart-1)', '#05C3FB'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'straight'
			},
			xaxis: {
				type: 'datetime',
				axisBorder: {
					show: false
				},
				axisTicks: {
					show: false
				},
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				tickAmount: 4,
				floating: false,

				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
					offsetY: -7,
					offsetX: 0,
				},
				axisBorder: {
					show: false,
				},
				axisTicks: {
					show: false
				}
			},
			fill: {
				opacity: 0.5
			},
			tooltip: {
				x: {
					format: "yyyy",
				},
				fixed: {
					enabled: false,
					position: 'topRight'
				}
			},
			grid: {
				borderColor: '#E6E6E6',
				yaxis: {
					lines: {
						offsetX: -30
					}
				},
				padding: {
					left: 20
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#areaCharts3"), options);
		chart.render();
	}
	if (jQuery("#areaCharts4").length > 0) {
		var options = {
			series: [{
				name: 'Network',
				data: [{
					x: 'Dec 23 2017',
					y: null
				},
				{
					x: 'Dec 24 2017',
					y: 44
				},
				{
					x: 'Dec 25 2017',
					y: 31
				},
				{
					x: 'Dec 26 2017',
					y: 38
				},
				{
					x: 'Dec 27 2017',
					y: null
				},
				{
					x: 'Dec 28 2017',
					y: 32
				},
				{
					x: 'Dec 29 2017',
					y: 55
				},
				{
					x: 'Dec 30 2017',
					y: 51
				},
				{
					x: 'Dec 31 2017',
					y: 67
				},
				{
					x: 'Jan 01 2018',
					y: 22
				},
				{
					x: 'Jan 02 2018',
					y: 34
				},
				{
					x: 'Jan 03 2018',
					y: null
				},
				{
					x: 'Jan 04 2018',
					y: null
				},
				{
					x: 'Jan 05 2018',
					y: 11
				},
				{
					x: 'Jan 06 2018',
					y: 4
				},
				{
					x: 'Jan 07 2018',
					y: 15,
				},
				{
					x: 'Jan 08 2018',
					y: null
				},
				{
					x: 'Jan 09 2018',
					y: 9
				},
				{
					x: 'Jan 10 2018',
					y: 34
				},
				{
					x: 'Jan 11 2018',
					y: null
				},
				{
					x: 'Jan 12 2018',
					y: null
				},
				{
					x: 'Jan 13 2018',
					y: 13
				},
				{
					x: 'Jan 14 2018',
					y: null
				}
				],
			}],
			chart: {
				type: 'area',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				animations: {
					enabled: false
				},
				zoom: {
					enabled: false
				},
				toolbar: {
					show: false,
				},
			},
			colors: ['var(--clr-chart-1)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'straight'
			},
			fill: {
				opacity: 0.8,
				type: 'pattern',
				pattern: {
					style: ['verticalLines', 'horizontalLines'],
					width: 5,
					height: 6
				},
			},
			markers: {
				size: 5,
				hover: {
					size: 9
				}
			},
			tooltip: {
				intersect: true,
				shared: false
			},
			theme: {
				palette: 'palette1'
			},
			xaxis: {
				type: 'datetime',
			},
		};

		var chart = new ApexCharts(document.querySelector("#areaCharts4"), options);
		chart.render();
	}
	if (jQuery("#areaCharts5").length > 0) {
		var options = {
			series: [{
				name: 'Net Profit',
				data: [30, 60, 35, 110, 45, 70, 60, 100]
			}, {
				name: 'Revenue',
				data: [65, 40, 80, 50, 100, 25, 85, 55]
			},
			{
				name: 'Net Profit',
				data: [40, 35, 55, 70, 80, 50, 30, 80]
			},],
			chart: {
				height: 305,
				type: 'area',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false
				},
			},
			colors: ['var(--clr-chart-1)', '#05C3FB', 'var(--clr-action-success)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'straight'
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				show: true,
				labels: {
					offsetX: -10,
					formatter: function (value) {
						return value + "k";
					},
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				show: false,
			},
			fill: {
				type: "gradient",
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.5,
					opacityTo: 0.5,
					stops: [0, 90, 100]
				}
			},
		};
		var chart = new ApexCharts(document.querySelector("#areaCharts5"), options);
		chart.render();

	}
	if (jQuery("#areaCharts6").length > 0) {
		var options = {
			series: [{
				name: 'Net Profit',
				data: [30, 60, 35, 110, 45, 70, 60, 100]
			}, {
				name: 'Revenue',
				data: [65, 40, 80, 50, 100, 25, 85, 55]
			},
			{
				name: 'Net Profit',
				data: [40, 35, 55, 70, 95, 50, 30, 80]
			},],
			chart: {
				height: 305,
				type: 'area',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				},
				zoom: {
					enabled: false
				},
			},
			colors: ['var(--clr-chart-1)', '#05C3FB', 'var(--clr-action-success)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				curve: 'smooth'
			},
			grid: {
				show: true,
				borderColor: '#E6E6E6',
			},
			xaxis: {
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			yaxis: {
				show: true,
				labels: {
					offsetX: -10,
					formatter: function (value) {
						return value + "k";
					},
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			legend: {
				show: false,
			},
			fill: {
				type: "gradient",
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.5,
					opacityTo: 0.5,
					stops: [0, 90, 100]
				}
			},
		};

		var chart = new ApexCharts(document.querySelector("#areaCharts6"), options);
		chart.render();
	}
	/* Column Chart */
	if (jQuery("#columnCharts").length > 0) {
		var options = {
			series: [{
				name: 'Order Today',
				data: [40, 50, 60, 70, 50, 90, 110]
			}, {
				name: 'Earning Today',
				data: [50, 60, 70, 80, 60, 40, 90]
			}, {
				name: 'Revenue Today',
				data: [60, 80, 60, 55, 95, 80, 105]
			}],
			chart: {
				type: 'bar',
				height: 350,
				width: '100%',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true,
					tools: {
						download: false,
					}
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)'],
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: '55%',
					endingShape: 'rounded'
				},
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				show: true,
				width: 2,
				colors: ['transparent']
			},
			xaxis: {
				categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun',],
				labels: {
					style: {
						colors: 'var(--clr-chart-1)',
						fontSize: '12px',
						fontFamily: 'var(--bd-fs-body)',
						fontWeight: 400,
						cssClass: 'apexcharts-xaxis-label',
					},
				},
			},
			fill: {
				opacity: 1
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "$ " + val + " thousands"
					}
				}
			},
			legend: {
				show: false,
			},
			yaxis: {
				tooltip: {
					enabled: true,
				},
				labels: {
					style: {
						colors: ["var(--clr-chart-1)"],
						fontWeight: 400,
						fontSize: '12px',
						fontFamily: "'Manrope', sans-serif",
					},
					offsetX: 0,
					offsetY: 0,
				},
			},
		};

		var chart = new ApexCharts(document.querySelector("#columnCharts"), options);
		chart.render();
	}
	if (jQuery("#columnCharts2").length > 0) {
		var options = {
			series: [{
				name: 'Inflation',
				data: [2.3, 3.1, 4.0, 10.1, 4.0, 3.6, 3.2, 2.3, 1.4, 0.8, 0.5, 0.2]
			}],
			chart: {
				height: 350,
				type: 'bar',
				foreColor: 'var(--clr-chart-1)',
			},
			colors: ['var(--clr-theme-primary)'],
			plotOptions: {
				bar: {
					borderRadius: 0,
					dataLabels: {
						position: 'top', /* top, center, bottom */
					},
				}
			},
			dataLabels: {
				enabled: true,
				formatter: function (val) {
					return val + "%";
				},
				offsetY: -20,
				style: {
					fontSize: '12px',
					colors: ["#304758"]
				}
			},

			xaxis: {
				categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
				position: 'top',
				axisBorder: {
					show: false
				},
				axisTicks: {
					show: false
				},
				crosshairs: {
					fill: {
						type: 'gradient',
						gradient: {
							colorFrom: '#D8E3F0',
							colorTo: '#BED1E6',
							stops: [0, 100],
							opacityFrom: 0.4,
							opacityTo: 0.5,
						}
					}
				},
				tooltip: {
					enabled: true,
				}
			},
			yaxis: {
				axisBorder: {
					show: false
				},
				axisTicks: {
					show: false,
				},
				labels: {
					show: false,
					formatter: function (val) {
						return val + "%";
					}
				}
			},
		};


		var chart = new ApexCharts(document.querySelector("#columnCharts2"), options);
		chart.render();
	}
	if (jQuery("#columnCharts3").length > 0) {

		var options = {
			series: [{
				name: 'PRODUCT A',
				data: [44, 55, 41, 67, 22, 43]
			}, {
				name: 'PRODUCT B',
				data: [13, 23, 20, 8, 13, 27]
			}, {
				name: 'PRODUCT C',
				data: [11, 17, 15, 15, 21, 14]
			}, {
				name: 'PRODUCT D',
				data: [21, 7, 25, 13, 22, 8]
			}],
			chart: {
				type: 'bar',
				height: 350,
				stacked: true,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				},
				zoom: {
					enabled: true
				},
				toolbar: {
					show: false,
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)', 'var(--clr-action-danger)'],
			responsive: [{
				breakpoint: 480,
				options: {
					legend: {
						position: 'bottom',
						offsetX: -10,
						offsetY: 0,
						labels: {
							colors: 'var(--clr-chart-1)',
							fontSize: '12px',
							fontFamily: 'var(--bd-fs-body)',
						},
					}
				}
			}],
			plotOptions: {
				bar: {
					horizontal: false,
					borderRadius: 0,
					dataLabels: {
						total: {
							enabled: true,
							style: {
								fontSize: '13px',
								fontWeight: 900
							}
						}
					}
				},
			},
			xaxis: {
				type: 'datetime',
				categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT',
					'01/05/2011 GMT', '01/06/2011 GMT'
				],
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			fill: {
				opacity: 1
			}
		};

		var chart = new ApexCharts(document.querySelector("#columnCharts3"), options);
		chart.render();
	}
	if (jQuery("#columnCharts4").length > 0) {
		var options = {
			series: [{
				name: 'PRODUCT A',
				data: [44, 55, 41, 67, 22, 43, 21, 49]
			}, {
				name: 'PRODUCT B',
				data: [13, 23, 20, 8, 13, 27, 33, 12]
			}, {
				name: 'PRODUCT C',
				data: [11, 17, 15, 15, 21, 14, 15, 13]
			}],
			chart: {
				type: 'bar',
				height: 350,
				stacked: true,
				stackType: '100%',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				},
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)'],
			responsive: [{
				breakpoint: 480,
				options: {
					legend: {
						position: 'bottom',
						offsetX: -10,
						offsetY: 0,
						labels: {
							colors: 'var(--clr-chart-1)',
							fontSize: '12px',
							fontFamily: 'var(--bd-fs-body)',
						},
					}
				}
			}],
			xaxis: {
				categories: ['2011 Q1', '2011 Q2', '2011 Q3', '2011 Q4', '2012 Q1', '2012 Q2',
					'2012 Q3', '2012 Q4'
				],
			},
			fill: {
				opacity: 1
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
		};
		var chart = new ApexCharts(document.querySelector("#columnCharts4"), options);
		chart.render();
	}
	if (jQuery("#columnCharts5").length > 0) {
		var options = {
			series: [
				{
					name: 'Q1 Budget',
					group: 'budget',
					data: [44000, 55000, 41000, 67000, 22000, 43000]
				},
				{
					name: 'Q1 Actual',
					group: 'actual',
					data: [48000, 50000, 40000, 65000, 25000, 40000]
				},
				{
					name: 'Q2 Budget',
					group: 'budget',
					data: [13000, 36000, 20000, 8000, 13000, 27000]
				},
				{
					name: 'Q2 Actual',
					group: 'actual',
					data: [20000, 40000, 25000, 10000, 12000, 28000]
				}
			],
			chart: {
				type: 'bar',
				height: 350,
				stacked: true,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			stroke: {
				width: 1,
				colors: ['#fff']
			},
			dataLabels: {
				formatter: (val) => {
					return val / 1000 + 'K'
				}
			},
			plotOptions: {
				bar: {
					horizontal: false
				}
			},
			xaxis: {
				categories: [
					'Online advertising',
					'Sales Training',
					'Print advertising',
					'Catalogs',
					'Meetings',
					'Public relations'
				]
			},
			fill: {
				opacity: 1
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)', 'var(--clr-action-danger)'],
			yaxis: {
				labels: {
					formatter: (val) => {
						return val / 1000 + 'K'
					}
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};
		var chart = new ApexCharts(document.querySelector("#columnCharts5"), options);
		chart.render();

	}
	if (jQuery("#columnCharts6").length > 0) {
		var options = {
			series: [
				{
					data: [
						{
							x: '2008',
							y: [2800, 4500]
						},
						{
							x: '2009',
							y: [3200, 4100]
						},
						{
							x: '2010',
							y: [2950, 7800]
						},
						{
							x: '2011',
							y: [3000, 4600]
						},
						{
							x: '2012',
							y: [3500, 4100]
						},
						{
							x: '2013',
							y: [4500, 6500]
						},
						{
							x: '2014',
							y: [4100, 5600]
						}
					]
				}
			],
			chart: {
				height: 350,
				type: 'rangeBar',
				foreColor: 'var(--clr-chart-1)',
				zoom: {
					enabled: false
				},
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			plotOptions: {
				bar: {
					isDumbbell: true,
					columnWidth: 3,
					dumbbellColors: [['var(--clr-theme-primary)', 'var(--clr-theme-secondary)']]
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			fill: {
				type: 'gradient',
				gradient: {
					type: 'vertical',
					gradientToColors: ['var(--clr-theme-primary)'],
					inverseColors: true,
					stops: [0, 100]
				}
			},
			grid: {
				xaxis: {
					lines: {
						show: true
					}
				},
				yaxis: {
					lines: {
						show: false
					}
				}
			},
			xaxis: {
				tickPlacement: 'on'
			}
		};
		var chart = new ApexCharts(document.querySelector("#columnCharts6"), options);
		chart.render();
	}
	if (jQuery("#columnCharts7").length > 0) {
		var options = {
			series: [{
				name: 'Cash Flow',
				data: [1.45, 5.42, 5.9, -0.42, -12.6, -18.1, -18.2, -14.16, -11.1, -6.09, 0.34, 3.88, 13.07,
					5.8, 2, 7.37, 8.1, 13.57, 15.75, 17.1, 19.8, -27.03, -54.4, -47.2, -43.3, -18.6, -
					48.6, -41.1, -39.6, -37.6, -29.4, -21.4, -2.4
				]
			}],
			chart: {
				type: 'bar',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			plotOptions: {
				bar: {
					colors: {
						ranges: [{
							from: -100,
							to: -46,
							color: 'var(--clr-theme-primary)'
						}, {
							from: -45,
							to: 0,
							color: 'var(--clr-theme-secondary)'
						}]
					},
					columnWidth: '80%',
				}
			},
			dataLabels: {
				enabled: false,
			},
			yaxis: {
				labels: {
					formatter: function (y) {
						return y.toFixed(0) + "%";
					}
				}
			},
			xaxis: {
				type: 'datetime',
				categories: [
					'2011-01-01', '2011-02-01', '2011-03-01', '2011-04-01', '2011-05-01', '2011-06-01',
					'2011-07-01', '2011-08-01', '2011-09-01', '2011-10-01', '2011-11-01', '2011-12-01',
					'2012-01-01', '2012-02-01', '2012-03-01', '2012-04-01', '2012-05-01', '2012-06-01',
					'2012-07-01', '2012-08-01', '2012-09-01', '2012-10-01', '2012-11-01', '2012-12-01',
					'2013-01-01', '2013-02-01', '2013-03-01', '2013-04-01', '2013-05-01', '2013-06-01',
					'2013-07-01', '2013-08-01', '2013-09-01'
				],
				labels: {
					rotate: -90
				}
			}
		};


		var chart = new ApexCharts(document.querySelector("#columnCharts7"), options);
		chart.render();
	}
	if (jQuery("#columnCharts8").length > 0) {
		var options = {
			series: [{
				data: [{
					x: 'Team A',
					y: [1, 5]
				}, {
					x: 'Team B',
					y: [4, 6]
				}, {
					x: 'Team C',
					y: [5, 8]
				}, {
					x: 'Team D',
					y: [3, 11]
				}]
			}, {
				data: [{
					x: 'Team A',
					y: [2, 6]
				}, {
					x: 'Team B',
					y: [1, 3]
				}, {
					x: 'Team C',
					y: [7, 8]
				}, {
					x: 'Team D',
					y: [5, 9]
				}]
			}],
			chart: {
				type: 'rangeBar',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			plotOptions: {
				bar: {
					horizontal: false
				}
			},
			dataLabels: {
				enabled: true
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#columnCharts8"), options);
		chart.render();
	}
	if (jQuery("#columnCharts9").length > 0) {
		var options = {
			series: [{
				data: [21, 22, 10, 28, 16, 21, 13, 30]
			}],
			chart: {
				height: 350,
				type: 'bar',
				foreColor: 'var(--clr-chart-1)',
				events: {
					click: function (chart, w, e) {
					}
				},
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)', 'var(--clr-action-info)', 'var(--clr-action-success)', 'var(--clr-action-link)', 'var(--clr-alert-danger)', 'var(--clr-alert-info)'],
			plotOptions: {
				bar: {
					columnWidth: '45%',
					distributed: true,
				}
			},
			dataLabels: {
				enabled: false
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			xaxis: {
				categories: [
					['John', 'Doe'],
					['Joe', 'Smith'],
					['Jake', 'Williams'],
					'Amber',
					['Peter', 'Brown'],
					['Mary', 'Evans'],
					['David', 'Wilson'],
					['Lily', 'Roberts'],
				],
				labels: {
					style: {
						colors: 'var(--clr-theme-primary)',
						fontSize: '12px'
					}
				}
			}
		};
		var chart = new ApexCharts(document.querySelector("#columnCharts9"), options);
		chart.render();
	}
	if (jQuery("#columnCharts10").length > 0) {
		var options = {
			series: [
				{
					name: 'Actual',
					data: [
						{
							x: '2011',
							y: 1292,
							goals: [
								{
									name: 'Expected',
									value: 1400,
									strokeHeight: 5,
									strokeColor: 'var(--clr-theme-secondary)'
								}
							]
						},
						{
							x: '2012',
							y: 4432,
							goals: [
								{
									name: 'Expected',
									value: 5400,
									strokeHeight: 5,
									strokeColor: 'var(--clr-theme-secondary)'
								}
							]
						},
						{
							x: '2013',
							y: 5423,
							goals: [
								{
									name: 'Expected',
									value: 5200,
									strokeHeight: 5,
									strokeColor: 'var(--clr-theme-secondary)'
								}
							]
						},
						{
							x: '2014',
							y: 6653,
							goals: [
								{
									name: 'Expected',
									value: 6500,
									strokeHeight: 5,
									strokeColor: 'var(--clr-theme-secondary)'
								}
							]
						},
						{
							x: '2015',
							y: 8133,
							goals: [
								{
									name: 'Expected',
									value: 6600,
									strokeHeight: 13,
									strokeWidth: 0,
									strokeLineCap: 'round',
									strokeColor: 'var(--clr-theme-secondary)'
								}
							]
						},
						{
							x: '2016',
							y: 7132,
							goals: [
								{
									name: 'Expected',
									value: 7500,
									strokeHeight: 5,
									strokeColor: 'var(--clr-theme-secondary)'
								}
							]
						},
						{
							x: '2017',
							y: 7332,
							goals: [
								{
									name: 'Expected',
									value: 8700,
									strokeHeight: 5,
									strokeColor: 'var(--clr-theme-secondary)'
								}
							]
						},
						{
							x: '2018',
							y: 6553,
							goals: [
								{
									name: 'Expected',
									value: 7300,
									strokeHeight: 2,
									strokeDashArray: 2,
									strokeColor: 'var(--clr-theme-secondary)'
								}
							]
						}
					]
				}
			],
			chart: {
				height: 350,
				type: 'bar',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				bar: {
					columnWidth: '60%'
				}
			},
			colors: ['var(--clr-theme-primary)'],
			dataLabels: {
				enabled: false
			},
			legend: {
				show: false,
				showForSingleSeries: true,
				customLegendItems: ['Actual', 'Expected'],
				markers: {
					fillColors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)']
				}
			}
		};

		var chart = new ApexCharts(document.querySelector("#columnCharts10"), options);
		chart.render();
	}
	/* Bar Chart */
	if (jQuery("#barCharts").length > 0) {
		var options = {
			series: [{
				data: [100, 150, 200, 250, 300, 350, 400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
			}],
			chart: {
				type: 'bar',
				height: 430,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				}
			},
			colors: ['var(--clr-theme-primary)'],
			plotOptions: {
				bar: {
					borderRadius: 0,
					horizontal: true,
				}
			},
			dataLabels: {
				enabled: false
			},
			xaxis: {
				categories: ['South Korea', 'Saudi Arabia', 'Switzerland', 'Turkey', 'Portugal', 'Sweden', 'United Arab Emirates', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan', 'Germany', 'China', 'United States'
				],
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#barCharts"), options);
		chart.render();
	}
	if (jQuery("#barCharts2").length > 0) {

		var options = {
			series: [{
				data: [44, 55, 41, 64, 22, 43, 21]
			}, {
				data: [53, 32, 33, 52, 13, 44, 32]
			}],
			chart: {
				type: 'bar',
				height: 430,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: false,
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			plotOptions: {
				bar: {
					horizontal: true,
					dataLabels: {
						position: 'top',
					},
				}
			},
			dataLabels: {
				enabled: true,
				offsetX: -6,
				style: {
					fontSize: '12px',
					colors: ['#fff']
				}
			},
			stroke: {
				show: true,
				width: 1,
				colors: ['#fff']
			},
			tooltip: {
				shared: true,
				intersect: false
			},
			xaxis: {
				categories: [2001, 2002, 2003, 2004, 2005, 2006, 2007],
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#barCharts2"), options);
		chart.render();
	}
	if (jQuery("#barCharts3").length > 0) {
		var options = {
			series: [{
				name: 'Marine Sprite',
				data: [44, 55, 41, 37, 22, 43, 21]
			}, {
				name: 'Striking Calf',
				data: [53, 32, 33, 52, 13, 43, 32]
			}, {
				name: 'Tank Picture',
				data: [12, 17, 11, 9, 15, 11, 20]
			}, {
				name: 'Bucket Slope',
				data: [9, 7, 5, 8, 6, 9, 4]
			}, {
				name: 'Reborn Kid',
				data: [25, 12, 19, 32, 25, 24, 10]
			}],
			chart: {
				type: 'bar',
				height: 350,
				stacked: true,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)', 'var(--clr-action-danger)'],
			plotOptions: {
				bar: {
					horizontal: true,
					dataLabels: {
						total: {
							enabled: true,
							offsetX: 0,
							style: {
								fontSize: '13px',
								fontWeight: 900
							}
						}
					}
				},
			},
			stroke: {
				width: 1,
				colors: ['#fff']
			},
			xaxis: {
				categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
				labels: {
					formatter: function (val) {
						return val + "K"
					}
				}
			},
			yaxis: {
				title: {
					text: undefined
				},
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return val + "K"
					}
				}
			},
			fill: {
				opacity: 1
			},
			legend: {
				show: false,
				position: 'top',
				horizontalAlign: 'left',
				offsetX: 40
			}
		};

		var chart = new ApexCharts(document.querySelector("#barCharts3"), options);
		chart.render();
	}
	if (jQuery("#barCharts4").length > 0) {
		var options = {
			series: [{
				name: 'Marine Sprite',
				data: [44, 55, 41, 37, 22, 43, 21]
			}, {
				name: 'Striking Calf',
				data: [53, 32, 33, 52, 13, 43, 32]
			}, {
				name: 'Tank Picture',
				data: [12, 17, 11, 9, 15, 11, 20]
			}, {
				name: 'Bucket Slope',
				data: [9, 7, 5, 8, 6, 9, 4]
			}, {
				name: 'Reborn Kid',
				data: [25, 12, 19, 32, 25, 24, 10]
			}],
			chart: {
				type: 'bar',
				height: 350,
				stacked: true,
				stackType: '100%',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)', 'var(--clr-action-danger)'],
			plotOptions: {
				bar: {
					horizontal: true,
				},
			},
			stroke: {
				width: 1,
				colors: ['#fff']
			},
			xaxis: {
				categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return val + "K"
					}
				}
			},
			fill: {
				opacity: 1

			},
			legend: {
				show: false,
				position: 'top',
				horizontalAlign: 'left',
				offsetX: 40
			}
		};
		var chart = new ApexCharts(document.querySelector("#barCharts4"), options);
		chart.render();
	}
	if (jQuery("#barCharts5").length > 0) {
		var options = {
			series: [{
				name: 'Males',
				data: [0.4, 0.65, 0.76, 0.88, 1.5, 2.1, 2.9, 3.8, 3.9, 4.2, 4, 4.3, 4.1, 4.2, 4.5,
					3.9, 3.5, 3
				]
			},
			{
				name: 'Females',
				data: [-0.8, -1.05, -1.06, -1.18, -1.4, -2.2, -2.85, -3.7, -3.96, -4.22, -4.3, -4.4,
				-4.1, -4, -4.1, -3.4, -3.1, -2.8
				]
			}
			],
			chart: {
				type: 'bar',
				height: 440,
				stacked: true,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-action-danger)'],
			plotOptions: {
				bar: {
					horizontal: true,
					barHeight: '80%',
				},
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				width: 1,
				colors: ["#fff"]
			},

			grid: {
				xaxis: {
					lines: {
						show: false
					}
				}
			},
			yaxis: {
				min: -5,
				max: 5,
			},
			tooltip: {
				shared: false,
				x: {
					formatter: function (val) {
						return val
					}
				},
				y: {
					formatter: function (val) {
						return Math.abs(val) + "%"
					}
				}
			},
			xaxis: {
				categories: ['85+', '80-84', '75-79', '70-74', '65-69', '60-64', '55-59', '50-54',
					'45-49', '40-44', '35-39', '30-34', '25-29', '20-24', '15-19', '10-14', '5-9',
					'0-4'
				],
				title: {
					text: 'Percent'
				},
				labels: {
					formatter: function (val) {
						return Math.abs(Math.round(val)) + "%"
					}
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};
		var chart = new ApexCharts(document.querySelector("#barCharts5"), options);
		chart.render();
	}
	if (jQuery("#barCharts6").length > 0) {

		var options = {
			series: [{
				data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
			}],
			chart: {
				type: 'bar',
				height: 380,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				bar: {
					barHeight: '100%',
					distributed: true,
					horizontal: true,
					dataLabels: {
						position: 'bottom'
					},
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-success)', 'var(--clr-action-info)', 'var(--clr-action-success)', 'var(--clr-action-link)', 'var(--clr-alert-danger)', 'var(--clr-alert-info)'],
			dataLabels: {
				enabled: true,
				textAnchor: 'start',
				style: {
					colors: ['#fff']
				},
				formatter: function (val, opt) {
					return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val
				},
				offsetX: 0,
				dropShadow: {
					enabled: true
				}
			},
			stroke: {
				width: 1,
				colors: ['#fff']
			},
			xaxis: {
				categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan',
					'Germany', 'China', 'United States'
				],
			},
			yaxis: {
				labels: {
					show: false
				}
			},
			tooltip: {
				theme: 'dark',
				x: {
					show: false
				},
				y: {
					title: {
						formatter: function () {
							return ''
						}
					}
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#barCharts6"), options);
		chart.render();
	}
	/* Mixed Charts */
	if (jQuery("#mixedCharts").length > 0) {
		var options = {
			series: [{
				name: 'TEAM A',
				type: 'column',
				data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
			}, {
				name: 'TEAM B',
				type: 'area',
				data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
			}, {
				name: 'TEAM C',
				type: 'line',
				data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
			}],
			chart: {
				height: 350,
				type: 'line',
				stacked: false,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			stroke: {
				width: [0, 2, 5],
				curve: 'smooth'
			},
			plotOptions: {
				bar: {
					columnWidth: '50%'
				}
			},

			fill: {
				opacity: [0.85, 0.25, 1],
				gradient: {
					inverseColors: false,
					shade: 'light',
					type: "vertical",
					opacityFrom: 0.85,
					opacityTo: 0.55,
					stops: [0, 100, 100, 100]
				}
			},
			labels: ['01/01/2003', '02/01/2003', '03/01/2003', '04/01/2003', '05/01/2003', '06/01/2003', '07/01/2003',
				'08/01/2003', '09/01/2003', '10/01/2003', '11/01/2003'
			],
			markers: {
				size: 0
			},
			xaxis: {
				type: 'datetime'
			},
			yaxis: {
				min: 0
			},
			tooltip: {
				shared: true,
				intersect: false,
				y: {
					formatter: function (y) {
						if (typeof y !== "undefined") {
							return y.toFixed(0) + " points";
						}
						return y;

					}
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#mixedCharts"), options);
		chart.render();
	}
	if (jQuery("#mixedCharts2").length > 0) {

		var options = {
			series: [{
				name: 'Website Blog',
				type: 'column',
				data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
			}, {
				name: 'Social Media',
				type: 'line',
				data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
			}],
			chart: {
				height: 350,
				type: 'line',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			stroke: {
				width: [0, 4]
			},
			dataLabels: {
				enabled: true,
				enabledOnSeries: [1]
			},
			labels: ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
			xaxis: {
				type: 'datetime'
			},
			yaxis: [{

			}, {
				opposite: true,
			}],
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#mixedCharts2"), options);
		chart.render();
	}
	if (jQuery("#mixedCharts3").length > 0) {
		var options = {
			series: [{
				name: 'Income',
				type: 'column',
				data: [1.4, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6]
			}, {
				name: 'Cashflow',
				type: 'column',
				data: [1.1, 3, 3.1, 4, 4.1, 4.9, 6.5, 8.5]
			}, {
				name: 'Revenue',
				type: 'line',
				data: [20, 29, 37, 36, 44, 45, 50, 58]
			}],
			chart: {
				height: 350,
				type: 'line',
				stacked: false,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			dataLabels: {
				enabled: false
			},
			stroke: {
				width: [1, 1, 4]
			},
			xaxis: {
				categories: [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016],
			},
			yaxis: [
				{
					axisTicks: {
						show: true,
					},
					axisBorder: {
						show: true,
						color: 'var(--clr-theme-primary)'
					},
					labels: {
						style: {
							colors: 'var(--clr-theme-primary)',
						}
					},
					title: {
						text: "Income (thousand crores)",
						style: {
							color: 'var(--clr-theme-primary)',
						}
					},
					tooltip: {
						enabled: true
					}
				},
				{
					seriesName: 'Income',
					opposite: true,
					axisTicks: {
						show: true,
					},
					axisBorder: {
						show: true,
						color: 'var(--clr-theme-secondary)'
					},
					labels: {
						style: {
							colors: 'var(--clr-theme-secondary)',
						}
					},
					title: {
						text: "Operating Cashflow (thousand crores)",
						style: {
							color: 'var(--clr-theme-secondary)',
						}
					},
				},
				{
					seriesName: 'Revenue',
					opposite: true,
					axisTicks: {
						show: true,
					},
					axisBorder: {
						show: true,
						color: 'var(--clr-theme-primary)'
					},
					labels: {
						style: {
							colors: 'var(--clr-theme-primary)',
						},
					},
					title: {
						text: "Revenue (thousand crores)",
						style: {
							color: 'var(--clr-theme-primary)',
						}
					}
				},
			],
			tooltip: {
				fixed: {
					enabled: true,
					position: 'topLeft', /* topRight, topLeft, bottomRight, bottomLeft */
					offsetY: 30,
					offsetX: 60
				},
			},
			legend: {
				show: false,
				horizontalAlign: 'left',
				offsetX: 40
			}
		};
		var chart = new ApexCharts(document.querySelector("#mixedCharts3"), options);
		chart.render();
	}
	if (jQuery("#mixedCharts4").length > 0) {
		var options = {
			series: [{
				name: 'TEAM A',
				type: 'area',
				data: [44, 55, 31, 47, 31, 43, 26, 41, 31, 47, 33]
			}, {
				name: 'TEAM B',
				type: 'line',
				data: [55, 69, 45, 61, 43, 54, 37, 52, 44, 61, 43]
			}],
			chart: {
				height: 350,
				type: 'line',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			stroke: {
				curve: 'smooth'
			},
			fill: {
				type: 'solid',
				opacity: [0.35, 1],
			},
			labels: ['Dec 01', 'Dec 02', 'Dec 03', 'Dec 04', 'Dec 05', 'Dec 06', 'Dec 07', 'Dec 08', 'Dec 09 ', 'Dec 10', 'Dec 11'],
			markers: {
				size: 0
			},
			yaxis: [
				{
				},
				{
					opposite: true,

				},
			],
			tooltip: {
				shared: true,
				intersect: false,
				y: {
					formatter: function (y) {
						if (typeof y !== "undefined") {
							return y.toFixed(0) + " points";
						}
						return y;
					}
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};


		var chart = new ApexCharts(document.querySelector("#mixedCharts4"), options);
		chart.render();
	}
	/* Range Charts */
	if (jQuery("#rangeCharts").length > 0) {
		var options = {
			series: [
				{
					type: 'rangeArea',
					name: 'Team B Range',

					data: [
						{
							x: 'Jan',
							y: [1100, 1900]
						},
						{
							x: 'Feb',
							y: [1200, 1800]
						},
						{
							x: 'Mar',
							y: [900, 2900]
						},
						{
							x: 'Apr',
							y: [1400, 2700]
						},
						{
							x: 'May',
							y: [2600, 3900]
						},
						{
							x: 'Jun',
							y: [500, 1700]
						},
						{
							x: 'Jul',
							y: [1900, 2300]
						},
						{
							x: 'Aug',
							y: [1000, 1500]
						}
					]
				},

				{
					type: 'rangeArea',
					name: 'Team A Range',
					data: [
						{
							x: 'Jan',
							y: [3100, 3400]
						},
						{
							x: 'Feb',
							y: [4200, 5200]
						},
						{
							x: 'Mar',
							y: [3900, 4900]
						},
						{
							x: 'Apr',
							y: [3400, 3900]
						},
						{
							x: 'May',
							y: [5100, 5900]
						},
						{
							x: 'Jun',
							y: [5400, 6700]
						},
						{
							x: 'Jul',
							y: [4300, 4600]
						},
						{
							x: 'Aug',
							y: [2100, 2900]
						}
					]
				},

				{
					type: 'line',
					name: 'Team B Median',
					data: [
						{
							x: 'Jan',
							y: 1500
						},
						{
							x: 'Feb',
							y: 1700
						},
						{
							x: 'Mar',
							y: 1900
						},
						{
							x: 'Apr',
							y: 2200
						},
						{
							x: 'May',
							y: 3000
						},
						{
							x: 'Jun',
							y: 1000
						},
						{
							x: 'Jul',
							y: 2100
						},
						{
							x: 'Aug',
							y: 1200
						},
						{
							x: 'Sep',
							y: 1800
						},
						{
							x: 'Oct',
							y: 2000
						}
					]
				},
				{
					type: 'line',
					name: 'Team A Median',
					data: [
						{
							x: 'Jan',
							y: 3300
						},
						{
							x: 'Feb',
							y: 4900
						},
						{
							x: 'Mar',
							y: 4300
						},
						{
							x: 'Apr',
							y: 3700
						},
						{
							x: 'May',
							y: 5500
						},
						{
							x: 'Jun',
							y: 5900
						},
						{
							x: 'Jul',
							y: 4500
						},
						{
							x: 'Aug',
							y: 2400
						},
						{
							x: 'Sep',
							y: 2100
						},
						{
							x: 'Oct',
							y: 1500
						}
					]
				}
			],
			chart: {
				height: 350,
				type: 'rangeArea',
				foreColor: 'var(--clr-chart-1)',
				animations: {
					speed: 500
				},
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-info)', 'var(--clr-action-success)'],
			dataLabels: {
				enabled: false
			},
			fill: {
				opacity: [0.24, 0.24, 1, 1]
			},
			forecastDataPoints: {
				count: 2
			},
			stroke: {
				curve: 'straight',
				width: [0, 0, 2, 2]
			},
			legend: {
				show: false,
				customLegendItems: ['Team B', 'Team A'],
				inverseOrder: true
			},
			markers: {
				hover: {
					sizeOffset: 5
				}
			},
		};
		var chart = new ApexCharts(document.querySelector("#rangeCharts"), options);
		chart.render();
	}
	if (jQuery("#rangeCharts2").length > 0) {
		var options = {
			series: [
				{
					name: 'New York Temperature',
					data: [
						{
							x: 'Jan',
							y: [-2, 4]
						},
						{
							x: 'Feb',
							y: [-1, 6]
						},
						{
							x: 'Mar',
							y: [3, 10]
						},
						{
							x: 'Apr',
							y: [8, 16]
						},
						{
							x: 'May',
							y: [13, 22]
						},
						{
							x: 'Jun',
							y: [18, 26]
						},
						{
							x: 'Jul',
							y: [21, 29]
						},
						{
							x: 'Aug',
							y: [21, 28]
						},
						{
							x: 'Sep',
							y: [17, 24]
						},
						{
							x: 'Oct',
							y: [11, 18]
						},
						{
							x: 'Nov',
							y: [6, 12]
						},
						{
							x: 'Dec',
							y: [1, 7]
						}
					]
				}
			],
			chart: {
				height: 350,
				type: 'rangeArea',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)'],
			stroke: {
				curve: 'straight'
			},
			markers: {
				hover: {
					sizeOffset: 5
				}
			},
			dataLabels: {
				enabled: false
			},
			yaxis: {
				labels: {
					formatter: (val) => {
						return val + '°C'
					}
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};
		var chart = new ApexCharts(document.querySelector("#rangeCharts2"), options);
		chart.render();
	}
	/* Timeline Charts */
	if (jQuery("#timelineCharts").length > 0) {
		var options = {
			series: [
				{
					data: [
						{
							x: 'Code',
							y: [
								new Date('2019-03-02').getTime(),
								new Date('2019-03-04').getTime()
							]
						},
						{
							x: 'Test',
							y: [
								new Date('2019-03-04').getTime(),
								new Date('2019-03-08').getTime()
							]
						},
						{
							x: 'Validation',
							y: [
								new Date('2019-03-08').getTime(),
								new Date('2019-03-12').getTime()
							]
						},
						{
							x: 'Deployment',
							y: [
								new Date('2019-03-12').getTime(),
								new Date('2019-03-18').getTime()
							]
						}
					]
				}
			],
			chart: {
				height: 350,
				type: 'rangeBar',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)'],
			plotOptions: {
				bar: {
					horizontal: true
				}
			},
			xaxis: {
				type: 'datetime'
			}
		};

		var chart = new ApexCharts(document.querySelector("#timelineCharts"), options);
		chart.render();
	}
	if (jQuery("#timelineCharts2").length > 0) {

		var options = {
			series: [
				{
					data: [
						{
							x: 'Analysis',
							y: [
								new Date('2019-02-27').getTime(),
								new Date('2019-03-04').getTime()
							],
							fillColor: '#008FFB'
						},
						{
							x: 'Design',
							y: [
								new Date('2019-03-04').getTime(),
								new Date('2019-03-08').getTime()
							],
							fillColor: '#00E396'
						},
						{
							x: 'Coding',
							y: [
								new Date('2019-03-07').getTime(),
								new Date('2019-03-10').getTime()
							],
							fillColor: '#775DD0'
						},
						{
							x: 'Testing',
							y: [
								new Date('2019-03-08').getTime(),
								new Date('2019-03-12').getTime()
							],
							fillColor: '#FEB019'
						},
						{
							x: 'Deployment',
							y: [
								new Date('2019-03-12').getTime(),
								new Date('2019-03-17').getTime()
							],
							fillColor: '#FF4560'
						}
					]
				}
			],
			chart: {
				height: 350,
				type: 'rangeBar',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-info)', 'var(--clr-action-success)', 'var(--clr-action-danger)'],
			plotOptions: {
				bar: {
					horizontal: true,
					distributed: true,
					dataLabels: {
						hideOverflowingLabels: false
					}
				}
			},
			dataLabels: {
				enabled: true, //test sur les barres
				formatter: function (val, obj) {
					return obj.w.config.series[obj.seriesIndex].data[obj.dataPointIndex].x;
				},
				style: {
					fontSize: "14px",
					fontWeight: "bold",
					colors: ["#f3f4f5", "#fff"]
				}
			},
			xaxis: {
				type: 'datetime'
			},
			yaxis: {
				show: false
			},
			grid: {
				row: {
					colors: ['#f3f4f5', '#fff'],
					opacity: 1
				}
			}
		};
		var chart = new ApexCharts(document.querySelector("#timelineCharts2"), options);
		chart.render();
	}
	if (jQuery("#timelineCharts3").length > 0) {
		var options = {
			series: [
				{
					name: 'Bob',
					data: [
						{
							x: 'Design',
							y: [
								new Date('2019-03-05').getTime(),
								new Date('2019-03-08').getTime()
							]
						},
						{
							x: 'Code',
							y: [
								new Date('2019-03-02').getTime(),
								new Date('2019-03-05').getTime()
							]
						},
						{
							x: 'Code',
							y: [
								new Date('2019-03-05').getTime(),
								new Date('2019-03-07').getTime()
							]
						},
						{
							x: 'Test',
							y: [
								new Date('2019-03-03').getTime(),
								new Date('2019-03-09').getTime()
							]
						},
						{
							x: 'Test',
							y: [
								new Date('2019-03-08').getTime(),
								new Date('2019-03-11').getTime()
							]
						},
						{
							x: 'Validation',
							y: [
								new Date('2019-03-11').getTime(),
								new Date('2019-03-16').getTime()
							]
						},
						{
							x: 'Design',
							y: [
								new Date('2019-03-01').getTime(),
								new Date('2019-03-03').getTime()
							],
						}
					]
				},
				{
					name: 'Joe',
					data: [
						{
							x: 'Design',
							y: [
								new Date('2019-03-02').getTime(),
								new Date('2019-03-05').getTime()
							]
						},
						{
							x: 'Test',
							y: [
								new Date('2019-03-06').getTime(),
								new Date('2019-03-16').getTime()
							],
							goals: [
								{
									name: 'Break',
									value: new Date('2019-03-10').getTime(),
									strokeColor: '#CD2F2A'
								}
							]
						},
						{
							x: 'Code',
							y: [
								new Date('2019-03-03').getTime(),
								new Date('2019-03-07').getTime()
							]
						},
						{
							x: 'Deployment',
							y: [
								new Date('2019-03-20').getTime(),
								new Date('2019-03-22').getTime()
							]
						},
						{
							x: 'Design',
							y: [
								new Date('2019-03-10').getTime(),
								new Date('2019-03-16').getTime()
							]
						}
					]
				},
				{
					name: 'Dan',
					data: [
						{
							x: 'Code',
							y: [
								new Date('2019-03-10').getTime(),
								new Date('2019-03-17').getTime()
							]
						},
						{
							x: 'Validation',
							y: [
								new Date('2019-03-05').getTime(),
								new Date('2019-03-09').getTime()
							],
							goals: [
								{
									name: 'Break',
									value: new Date('2019-03-07').getTime(),
									strokeColor: '#CD2F2A'
								}
							]
						},
					]
				}
			],
			chart: {
				height: 450,
				type: 'rangeBar',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)', 'var(--clr-action-info)', 'var(--clr-action-success)', 'var(--clr-action-danger)'],
			plotOptions: {
				bar: {
					horizontal: true,
					barHeight: '80%'
				}
			},
			xaxis: {
				type: 'datetime'
			},
			stroke: {
				width: 1
			},
			fill: {
				type: 'solid',
				opacity: 0.6
			},
			legend: {
				show: false,
				position: 'top',
				horizontalAlign: 'left'
			}
		};
		var chart = new ApexCharts(document.querySelector("#timelineCharts3"), options);
		chart.render();
	}
	if (jQuery("#timelineCharts4").length > 0) {
		var options = {
			series: [
				/* George Washington */
				{
					name: 'George Washington',
					data: [
						{
							x: 'President',
							y: [
								new Date(1789, 3, 30).getTime(),
								new Date(1797, 2, 4).getTime()
							]
						},
					]
				},
				/* John Adams */
				{
					name: 'John Adams',
					data: [
						{
							x: 'President',
							y: [
								new Date(1797, 2, 4).getTime(),
								new Date(1801, 2, 4).getTime()
							]
						},
						{
							x: 'Vice President',
							y: [
								new Date(1789, 3, 21).getTime(),
								new Date(1797, 2, 4).getTime()
							]
						}
					]
				},
				/* Thomas Jefferson */
				{
					name: 'Thomas Jefferson',
					data: [
						{
							x: 'President',
							y: [
								new Date(1801, 2, 4).getTime(),
								new Date(1809, 2, 4).getTime()
							]
						},
						{
							x: 'Vice President',
							y: [
								new Date(1797, 2, 4).getTime(),
								new Date(1801, 2, 4).getTime()
							]
						},
						{
							x: 'Secretary of State',
							y: [
								new Date(1790, 2, 22).getTime(),
								new Date(1793, 11, 31).getTime()
							]
						}
					]
				},
				/* Aaron Burr */
				{
					name: 'Aaron Burr',
					data: [
						{
							x: 'Vice President',
							y: [
								new Date(1801, 2, 4).getTime(),
								new Date(1805, 2, 4).getTime()
							]
						}
					]
				},
				/* George Clinton */
				{
					name: 'George Clinton',
					data: [
						{
							x: 'Vice President',
							y: [
								new Date(1805, 2, 4).getTime(),
								new Date(1812, 3, 20).getTime()
							]
						}
					]
				},
				/* John Jay */
				{
					name: 'John Jay',
					data: [
						{
							x: 'Secretary of State',
							y: [
								new Date(1789, 8, 25).getTime(),
								new Date(1790, 2, 22).getTime()
							]
						}
					]
				},
				/* Edmund Randolph */
				{
					name: 'Edmund Randolph',
					data: [
						{
							x: 'Secretary of State',
							y: [
								new Date(1794, 0, 2).getTime(),
								new Date(1795, 7, 20).getTime()
							]
						}
					]
				},
				/* Timothy Pickering */
				{
					name: 'Timothy Pickering',
					data: [
						{
							x: 'Secretary of State',
							y: [
								new Date(1795, 7, 20).getTime(),
								new Date(1800, 4, 12).getTime()
							]
						}
					]
				},
				/* Charles Lee */
				{
					name: 'Charles Lee',
					data: [
						{
							x: 'Secretary of State',
							y: [
								new Date(1800, 4, 13).getTime(),
								new Date(1800, 5, 5).getTime()
							]
						}
					]
				},
				/* John Marshall */
				{
					name: 'John Marshall',
					data: [
						{
							x: 'Secretary of State',
							y: [
								new Date(1800, 5, 13).getTime(),
								new Date(1801, 2, 4).getTime()
							]
						}
					]
				},
				/* Levi Lincoln */
				{
					name: 'Levi Lincoln',
					data: [
						{
							x: 'Secretary of State',
							y: [
								new Date(1801, 2, 5).getTime(),
								new Date(1801, 4, 1).getTime()
							]
						}
					]
				},
				/* James Madison */
				{
					name: 'James Madison',
					data: [
						{
							x: 'Secretary of State',
							y: [
								new Date(1801, 4, 2).getTime(),
								new Date(1809, 2, 3).getTime()
							]
						}
					]
				},
			],
			chart: {
				height: 450,
				type: 'rangeBar',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				bar: {
					horizontal: true,
					barHeight: '50%',
					rangeBarGroupRows: true
				}
			},
			colors: [
				"var(--clr-theme-primary)", "var(--clr-theme-secondary)", "var(--clr-action-success)", "var(--clr-action-info)", "var(--clr-action-success)",
				"var(--clr-action-link)", "var(--clr-action-danger)", "var(--clr-alert-success)", "var(--clr-alert-info)", "var(--clr-alert-danger)",
				"var(--clr-alert-warning)", "var(--clr-chart-1)", "var(--clr-action-success)", "var(--clr-text-label)", "var(--clr-text-rating)"
			],
			fill: {
				type: 'solid'
			},
			xaxis: {
				type: 'datetime'
			},
			legend: {
				position: 'right',
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			tooltip: {
				custom: function ({ series, seriesIndex, dataPointIndex, w }) {
					const fromYear = new Date(w.globals.seriesRangeStart[seriesIndex][dataPointIndex]).getFullYear();
					const toYear = new Date(w.globals.seriesRangeEnd[seriesIndex][dataPointIndex]).getFullYear();

					return `From ${fromYear} to ${toYear}`;
				}
			}

		};
		var chart = new ApexCharts(document.querySelector("#timelineCharts4"), options);
		chart.render();
	}
	/* Funnel Charts */
	if (jQuery("#funnelCharts").length > 0) {
		var options = {
			series: [
				{
					name: "Funnel Series",
					data: [1380, 1100, 990, 880, 740, 548, 330, 200],
				},
			],
			chart: {
				type: 'bar',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
			},
			plotOptions: {
				bar: {
					borderRadius: 0,
					horizontal: true,
					barHeight: '80%',
					isFunnel: true,
				},
			},
			dataLabels: {
				enabled: true,
				formatter: function (val, opt) {
					return opt.w.globals.labels[opt.dataPointIndex] + ':  ' + val
				},
				dropShadow: {
					enabled: true,
				},
			},
			xaxis: {
				categories: [
					'Sourced',
					'Screened',
					'Assessed',
					'HR Interview',
					'Technical',
					'Verify',
					'Offered',
					'Hired',
				],
			},
			legend: {
				show: false,
			},
		};

		var chart = new ApexCharts(document.querySelector("#funnelCharts"), options);
		chart.render();
	}
	if (jQuery("#funnelCharts2").length > 0) {
		var options = {
			series: [
				{
					name: "",
					data: [200, 330, 548, 740, 880, 990, 1100, 1380],
				},
			],
			chart: {
				type: 'bar',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				bar: {
					borderRadius: 0,
					horizontal: true,
					distributed: true,
					barHeight: '80%',
					isFunnel: true,
				},
			},
			colors: [
				'var(--clr-chart-1)',
				'#05C3FB',
				'#FF3A29',
				'#80CAFF',
				'#9747FF',
				'#34B53A',
				'#34B53A',
				'#24A581',
			],
			dataLabels: {
				enabled: true,
				formatter: function (val, opt) {
					return opt.w.globals.labels[opt.dataPointIndex]
				},
				dropShadow: {
					enabled: true,
				},
			},
			xaxis: {
				categories: ['Sweets', 'Processed Foods', 'Healthy Fats', 'Meat', 'Beans & Legumes', 'Dairy', 'Fruits & Vegetables', 'Grains'],
			},
			legend: {
				show: false,
			},
		};

		var chart = new ApexCharts(document.querySelector("#funnelCharts2"), options);
		chart.render();
	}
	/* Candlestick Charts */
	if (jQuery("#candlestickCharts").length > 0) {
		var options = {
			series: [{
				data: [{
					x: new Date(1538778600000),
					y: [6629.81, 6650.5, 6623.04, 6633.33]
				},
				{
					x: new Date(1538780400000),
					y: [6632.01, 6643.59, 6620, 6630.11]
				},
				{
					x: new Date(1538782200000),
					y: [6630.71, 6648.95, 6623.34, 6635.65]
				},
				{
					x: new Date(1538784000000),
					y: [6635.65, 6651, 6629.67, 6638.24]
				},
				{
					x: new Date(1538785800000),
					y: [6638.24, 6640, 6620, 6624.47]
				},
				{
					x: new Date(1538787600000),
					y: [6624.53, 6636.03, 6621.68, 6624.31]
				},
				{
					x: new Date(1538789400000),
					y: [6624.61, 6632.2, 6617, 6626.02]
				},
				{
					x: new Date(1538791200000),
					y: [6627, 6627.62, 6584.22, 6603.02]
				},
				{
					x: new Date(1538793000000),
					y: [6605, 6608.03, 6598.95, 6604.01]
				},
				{
					x: new Date(1538794800000),
					y: [6604.5, 6614.4, 6602.26, 6608.02]
				},
				{
					x: new Date(1538796600000),
					y: [6608.02, 6610.68, 6601.99, 6608.91]
				},
				{
					x: new Date(1538798400000),
					y: [6608.91, 6618.99, 6608.01, 6612]
				},
				{
					x: new Date(1538800200000),
					y: [6612, 6615.13, 6605.09, 6612]
				},
				{
					x: new Date(1538802000000),
					y: [6612, 6624.12, 6608.43, 6622.95]
				},
				{
					x: new Date(1538803800000),
					y: [6623.91, 6623.91, 6615, 6615.67]
				},
				{
					x: new Date(1538805600000),
					y: [6618.69, 6618.74, 6610, 6610.4]
				},
				{
					x: new Date(1538807400000),
					y: [6611, 6622.78, 6610.4, 6614.9]
				},
				{
					x: new Date(1538809200000),
					y: [6614.9, 6626.2, 6613.33, 6623.45]
				},
				{
					x: new Date(1538811000000),
					y: [6623.48, 6627, 6618.38, 6620.35]
				},
				{
					x: new Date(1538812800000),
					y: [6619.43, 6620.35, 6610.05, 6615.53]
				},
				{
					x: new Date(1538814600000),
					y: [6615.53, 6617.93, 6610, 6615.19]
				},
				{
					x: new Date(1538816400000),
					y: [6615.19, 6621.6, 6608.2, 6620]
				},
				{
					x: new Date(1538818200000),
					y: [6619.54, 6625.17, 6614.15, 6620]
				},
				{
					x: new Date(1538820000000),
					y: [6620.33, 6634.15, 6617.24, 6624.61]
				},
				{
					x: new Date(1538821800000),
					y: [6625.95, 6626, 6611.66, 6617.58]
				},
				{
					x: new Date(1538823600000),
					y: [6619, 6625.97, 6595.27, 6598.86]
				},
				{
					x: new Date(1538825400000),
					y: [6598.86, 6598.88, 6570, 6587.16]
				},
				{
					x: new Date(1538827200000),
					y: [6588.86, 6600, 6580, 6593.4]
				},
				{
					x: new Date(1538829000000),
					y: [6593.99, 6598.89, 6585, 6587.81]
				},
				{
					x: new Date(1538830800000),
					y: [6587.81, 6592.73, 6567.14, 6578]
				},
				{
					x: new Date(1538832600000),
					y: [6578.35, 6581.72, 6567.39, 6579]
				},
				{
					x: new Date(1538834400000),
					y: [6579.38, 6580.92, 6566.77, 6575.96]
				},
				{
					x: new Date(1538836200000),
					y: [6575.96, 6589, 6571.77, 6588.92]
				},
				{
					x: new Date(1538838000000),
					y: [6588.92, 6594, 6577.55, 6589.22]
				},
				{
					x: new Date(1538839800000),
					y: [6589.3, 6598.89, 6589.1, 6596.08]
				},
				{
					x: new Date(1538841600000),
					y: [6597.5, 6600, 6588.39, 6596.25]
				},
				{
					x: new Date(1538843400000),
					y: [6598.03, 6600, 6588.73, 6595.97]
				},
				{
					x: new Date(1538845200000),
					y: [6595.97, 6602.01, 6588.17, 6602]
				},
				{
					x: new Date(1538847000000),
					y: [6602, 6607, 6596.51, 6599.95]
				},
				{
					x: new Date(1538848800000),
					y: [6600.63, 6601.21, 6590.39, 6591.02]
				},
				{
					x: new Date(1538850600000),
					y: [6591.02, 6603.08, 6591, 6591]
				},
				{
					x: new Date(1538852400000),
					y: [6591, 6601.32, 6585, 6592]
				},
				{
					x: new Date(1538854200000),
					y: [6593.13, 6596.01, 6590, 6593.34]
				},
				{
					x: new Date(1538856000000),
					y: [6593.34, 6604.76, 6582.63, 6593.86]
				},
				{
					x: new Date(1538857800000),
					y: [6593.86, 6604.28, 6586.57, 6600.01]
				},
				{
					x: new Date(1538859600000),
					y: [6601.81, 6603.21, 6592.78, 6596.25]
				},
				{
					x: new Date(1538861400000),
					y: [6596.25, 6604.2, 6590, 6602.99]
				},
				{
					x: new Date(1538863200000),
					y: [6602.99, 6606, 6584.99, 6587.81]
				},
				{
					x: new Date(1538865000000),
					y: [6587.81, 6595, 6583.27, 6591.96]
				},
				{
					x: new Date(1538866800000),
					y: [6591.97, 6596.07, 6585, 6588.39]
				},
				{
					x: new Date(1538868600000),
					y: [6587.6, 6598.21, 6587.6, 6594.27]
				},
				{
					x: new Date(1538870400000),
					y: [6596.44, 6601, 6590, 6596.55]
				},
				{
					x: new Date(1538872200000),
					y: [6598.91, 6605, 6596.61, 6600.02]
				},
				{
					x: new Date(1538874000000),
					y: [6600.55, 6605, 6589.14, 6593.01]
				},
				{
					x: new Date(1538875800000),
					y: [6593.15, 6605, 6592, 6603.06]
				},
				{
					x: new Date(1538877600000),
					y: [6603.07, 6604.5, 6599.09, 6603.89]
				},
				{
					x: new Date(1538879400000),
					y: [6604.44, 6604.44, 6600, 6603.5]
				},
				{
					x: new Date(1538881200000),
					y: [6603.5, 6603.99, 6597.5, 6603.86]
				},
				{
					x: new Date(1538883000000),
					y: [6603.85, 6605, 6600, 6604.07]
				},
				{
					x: new Date(1538884800000),
					y: [6604.98, 6606, 6604.07, 6606]
				},
				]
			}],
			chart: {
				type: 'candlestick',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				candlestick: {
					colors: {
						upward: "var(--clr-theme-primary)",
						downward: 'var(--clr-theme-secondary)'
					},
					wick: {
						useFillColor: true
					}
				}
			},
			xaxis: {
				type: 'datetime'
			},
			yaxis: {
				tooltip: {
					enabled: true
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#candlestickCharts"), options);
		chart.render();
	}
	if (jQuery("#candlestickCharts2").length > 0) {
		var options = {
			series: [{
				name: 'candle',
				data: [
					{
						x: new Date(1538778600000),
						y: [6629.81, 6650.5, 6623.04, 6633.33]
					},
					{
						x: new Date(1538780400000),
						y: [6632.01, 6643.59, 6620, 6630.11]
					},
					{
						x: new Date(1538782200000),
						y: [6630.71, 6648.95, 6623.34, 6635.65]
					},
					{
						x: new Date(1538784000000),
						y: [6635.65, 6651, 6629.67, 6638.24]
					},
					{
						x: new Date(1538785800000),
						y: [6638.24, 6640, 6620, 6624.47]
					},
					{
						x: new Date(1538787600000),
						y: [6624.53, 6636.03, 6621.68, 6624.31]
					},
					{
						x: new Date(1538789400000),
						y: [6624.61, 6632.2, 6617, 6626.02]
					},
					{
						x: new Date(1538791200000),
						y: [6627, 6627.62, 6584.22, 6603.02]
					},
					{
						x: new Date(1538793000000),
						y: [6605, 6608.03, 6598.95, 6604.01]
					},
					{
						x: new Date(1538794800000),
						y: [6604.5, 6614.4, 6602.26, 6608.02]
					},
					{
						x: new Date(1538796600000),
						y: [6608.02, 6610.68, 6601.99, 6608.91]
					},
					{
						x: new Date(1538798400000),
						y: [6608.91, 6618.99, 6608.01, 6612]
					},
					{
						x: new Date(1538800200000),
						y: [6612, 6615.13, 6605.09, 6612]
					},
					{
						x: new Date(1538802000000),
						y: [6612, 6624.12, 6608.43, 6622.95]
					},
					{
						x: new Date(1538803800000),
						y: [6623.91, 6623.91, 6615, 6615.67]
					},
					{
						x: new Date(1538805600000),
						y: [6618.69, 6618.74, 6610, 6610.4]
					},
					{
						x: new Date(1538807400000),
						y: [6611, 6622.78, 6610.4, 6614.9]
					},
					{
						x: new Date(1538809200000),
						y: [6614.9, 6626.2, 6613.33, 6623.45]
					},
					{
						x: new Date(1538811000000),
						y: [6623.48, 6627, 6618.38, 6620.35]
					},
					{
						x: new Date(1538812800000),
						y: [6619.43, 6620.35, 6610.05, 6615.53]
					},
					{
						x: new Date(1538814600000),
						y: [6615.53, 6617.93, 6610, 6615.19]
					},
					{
						x: new Date(1538816400000),
						y: [6615.19, 6621.6, 6608.2, 6620]
					},
					{
						x: new Date(1538818200000),
						y: [6619.54, 6625.17, 6614.15, 6620]
					},
					{
						x: new Date(1538820000000),
						y: [6620.33, 6634.15, 6617.24, 6624.61]
					},
					{
						x: new Date(1538821800000),
						y: [6625.95, 6626, 6611.66, 6617.58]
					},
					{
						x: new Date(1538823600000),
						y: [6619, 6625.97, 6595.27, 6598.86]
					},
					{
						x: new Date(1538825400000),
						y: [6598.86, 6598.88, 6570, 6587.16]
					},
					{
						x: new Date(1538827200000),
						y: [6588.86, 6600, 6580, 6593.4]
					},
					{
						x: new Date(1538829000000),
						y: [6593.99, 6598.89, 6585, 6587.81]
					},
					{
						x: new Date(1538830800000),
						y: [6587.81, 6592.73, 6567.14, 6578]
					},
					{
						x: new Date(1538832600000),
						y: [6578.35, 6581.72, 6567.39, 6579]
					},
					{
						x: new Date(1538834400000),
						y: [6579.38, 6580.92, 6566.77, 6575.96]
					},
					{
						x: new Date(1538836200000),
						y: [6575.96, 6589, 6571.77, 6588.92]
					},
					{
						x: new Date(1538838000000),
						y: [6588.92, 6594, 6577.55, 6589.22]
					},
					{
						x: new Date(1538839800000),
						y: [6589.3, 6598.89, 6589.1, 6596.08]
					},
					{
						x: new Date(1538841600000),
						y: [6597.5, 6600, 6588.39, 6596.25]
					},
					{
						x: new Date(1538843400000),
						y: [6598.03, 6600, 6588.73, 6595.97]
					},
					{
						x: new Date(1538845200000),
						y: [6595.97, 6602.01, 6588.17, 6602]
					},
					{
						x: new Date(1538847000000),
						y: [6602, 6607, 6596.51, 6599.95]
					},
					{
						x: new Date(1538848800000),
						y: [6600.63, 6601.21, 6590.39, 6591.02]
					},
					{
						x: new Date(1538850600000),
						y: [6591.02, 6603.08, 6591, 6591]
					},
					{
						x: new Date(1538852400000),
						y: [6591, 6601.32, 6585, 6592]
					},
					{
						x: new Date(1538854200000),
						y: [6593.13, 6596.01, 6590, 6593.34]
					},
					{
						x: new Date(1538856000000),
						y: [6593.34, 6604.76, 6582.63, 6593.86]
					},
					{
						x: new Date(1538857800000),
						y: [6593.86, 6604.28, 6586.57, 6600.01]
					},
					{
						x: new Date(1538859600000),
						y: [6601.81, 6603.21, 6592.78, 6596.25]
					},
					{
						x: new Date(1538861400000),
						y: [6596.25, 6604.2, 6590, 6602.99]
					},
					{
						x: new Date(1538863200000),
						y: [6602.99, 6606, 6584.99, 6587.81]
					},
					{
						x: new Date(1538865000000),
						y: [6587.81, 6595, 6583.27, 6591.96]
					},
					{
						x: new Date(1538866800000),
						y: [6591.97, 6596.07, 6585, 6588.39]
					},
					{
						x: new Date(1538868600000),
						y: [6587.6, 6598.21, 6587.6, 6594.27]
					},
					{
						x: new Date(1538870400000),
						y: [6596.44, 6601, 6590, 6596.55]
					},
					{
						x: new Date(1538872200000),
						y: [6598.91, 6605, 6596.61, 6600.02]
					},
					{
						x: new Date(1538874000000),
						y: [6600.55, 6605, 6589.14, 6593.01]
					},
					{
						x: new Date(1538875800000),
						y: [6593.15, 6605, 6592, 6603.06]
					},
					{
						x: new Date(1538877600000),
						y: [6603.07, 6604.5, 6599.09, 6603.89]
					},
					{
						x: new Date(1538879400000),
						y: [6604.44, 6604.44, 6600, 6603.5]
					},
					{
						x: new Date(1538881200000),
						y: [6603.5, 6603.99, 6597.5, 6603.86]
					},
					{
						x: new Date(1538883000000),
						y: [6603.85, 6605, 6600, 6604.07]
					},
					{
						x: new Date(1538884800000),
						y: [6604.98, 6606, 6604.07, 6606]
					},
				]
			}],
			chart: {
				height: 350,
				type: 'candlestick',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				candlestick: {
					colors: {
						upward: "var(--clr-theme-primary)",
						downward: 'var(--clr-theme-secondary)'
					},
					wick: {
						useFillColor: true
					}
				}
			},
			annotations: {
				xaxis: [
					{
						x: 'Oct 06 14:00',
						borderColor: 'var(--clr-chart-1)',
						label: {
							borderColor: 'var(--clr-chart-1)',
							style: {
								fontSize: '12px',
								color: '#fff',
								background: 'var(--clr-chart-1)'
							},
							orientation: 'horizontal',
							offsetY: 7,
							text: 'Annotation Test'
						}
					}
				]
			},
			tooltip: {
				enabled: true,
			},
			xaxis: {
				type: 'category',
				labels: {
					formatter: function (val) {
						return dayjs(val).format('MMM DD HH:mm')
					}
				}
			},
			yaxis: {
				tooltip: {
					enabled: true
				}
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#candlestickCharts2"), options);
		chart.render();
	}
	if (jQuery("#candlestickCharts3").length > 0) {
		var options = {
			series: [{
				name: 'line',
				type: 'line',
				data: [
					{
						x: new Date(1538778600000),
						y: 6604
					}, {
						x: new Date(1538782200000),
						y: 6602
					}, {
						x: new Date(1538814600000),
						y: 6607
					}, {
						x: new Date(1538884800000),
						y: 6620
					}
				]
			}, {
				name: 'candle',
				type: 'candlestick',
				data: [
					{
						x: new Date(1538778600000),
						y: [6629.81, 6650.5, 6623.04, 6633.33]
					},
					{
						x: new Date(1538780400000),
						y: [6632.01, 6643.59, 6620, 6630.11]
					},
					{
						x: new Date(1538782200000),
						y: [6630.71, 6648.95, 6623.34, 6635.65]
					},
					{
						x: new Date(1538784000000),
						y: [6635.65, 6651, 6629.67, 6638.24]
					},
					{
						x: new Date(1538785800000),
						y: [6638.24, 6640, 6620, 6624.47]
					},
					{
						x: new Date(1538787600000),
						y: [6624.53, 6636.03, 6621.68, 6624.31]
					},
					{
						x: new Date(1538789400000),
						y: [6624.61, 6632.2, 6617, 6626.02]
					},
					{
						x: new Date(1538791200000),
						y: [6627, 6627.62, 6584.22, 6603.02]
					},
					{
						x: new Date(1538793000000),
						y: [6605, 6608.03, 6598.95, 6604.01]
					},
					{
						x: new Date(1538794800000),
						y: [6604.5, 6614.4, 6602.26, 6608.02]
					},
					{
						x: new Date(1538796600000),
						y: [6608.02, 6610.68, 6601.99, 6608.91]
					},
					{
						x: new Date(1538798400000),
						y: [6608.91, 6618.99, 6608.01, 6612]
					},
					{
						x: new Date(1538800200000),
						y: [6612, 6615.13, 6605.09, 6612]
					},
					{
						x: new Date(1538802000000),
						y: [6612, 6624.12, 6608.43, 6622.95]
					},
					{
						x: new Date(1538803800000),
						y: [6623.91, 6623.91, 6615, 6615.67]
					},
					{
						x: new Date(1538805600000),
						y: [6618.69, 6618.74, 6610, 6610.4]
					},
					{
						x: new Date(1538807400000),
						y: [6611, 6622.78, 6610.4, 6614.9]
					},
					{
						x: new Date(1538809200000),
						y: [6614.9, 6626.2, 6613.33, 6623.45]
					},
					{
						x: new Date(1538811000000),
						y: [6623.48, 6627, 6618.38, 6620.35]
					},
					{
						x: new Date(1538812800000),
						y: [6619.43, 6620.35, 6610.05, 6615.53]
					},
					{
						x: new Date(1538814600000),
						y: [6615.53, 6617.93, 6610, 6615.19]
					},
					{
						x: new Date(1538816400000),
						y: [6615.19, 6621.6, 6608.2, 6620]
					},
					{
						x: new Date(1538818200000),
						y: [6619.54, 6625.17, 6614.15, 6620]
					},
					{
						x: new Date(1538820000000),
						y: [6620.33, 6634.15, 6617.24, 6624.61]
					},
					{
						x: new Date(1538821800000),
						y: [6625.95, 6626, 6611.66, 6617.58]
					},
					{
						x: new Date(1538823600000),
						y: [6619, 6625.97, 6595.27, 6598.86]
					},
					{
						x: new Date(1538825400000),
						y: [6598.86, 6598.88, 6570, 6587.16]
					},
					{
						x: new Date(1538827200000),
						y: [6588.86, 6600, 6580, 6593.4]
					},
					{
						x: new Date(1538829000000),
						y: [6593.99, 6598.89, 6585, 6587.81]
					},
					{
						x: new Date(1538830800000),
						y: [6587.81, 6592.73, 6567.14, 6578]
					},
					{
						x: new Date(1538832600000),
						y: [6578.35, 6581.72, 6567.39, 6579]
					},
					{
						x: new Date(1538834400000),
						y: [6579.38, 6580.92, 6566.77, 6575.96]
					},
					{
						x: new Date(1538836200000),
						y: [6575.96, 6589, 6571.77, 6588.92]
					},
					{
						x: new Date(1538838000000),
						y: [6588.92, 6594, 6577.55, 6589.22]
					},
					{
						x: new Date(1538839800000),
						y: [6589.3, 6598.89, 6589.1, 6596.08]
					},
					{
						x: new Date(1538841600000),
						y: [6597.5, 6600, 6588.39, 6596.25]
					},
					{
						x: new Date(1538843400000),
						y: [6598.03, 6600, 6588.73, 6595.97]
					},
					{
						x: new Date(1538845200000),
						y: [6595.97, 6602.01, 6588.17, 6602]
					},
					{
						x: new Date(1538847000000),
						y: [6602, 6607, 6596.51, 6599.95]
					},
					{
						x: new Date(1538848800000),
						y: [6600.63, 6601.21, 6590.39, 6591.02]
					},
					{
						x: new Date(1538850600000),
						y: [6591.02, 6603.08, 6591, 6591]
					},
					{
						x: new Date(1538852400000),
						y: [6591, 6601.32, 6585, 6592]
					},
					{
						x: new Date(1538854200000),
						y: [6593.13, 6596.01, 6590, 6593.34]
					},
					{
						x: new Date(1538856000000),
						y: [6593.34, 6604.76, 6582.63, 6593.86]
					},
					{
						x: new Date(1538857800000),
						y: [6593.86, 6604.28, 6586.57, 6600.01]
					},
					{
						x: new Date(1538859600000),
						y: [6601.81, 6603.21, 6592.78, 6596.25]
					},
					{
						x: new Date(1538861400000),
						y: [6596.25, 6604.2, 6590, 6602.99]
					},
					{
						x: new Date(1538863200000),
						y: [6602.99, 6606, 6584.99, 6587.81]
					},
					{
						x: new Date(1538865000000),
						y: [6587.81, 6595, 6583.27, 6591.96]
					},
					{
						x: new Date(1538866800000),
						y: [6591.97, 6596.07, 6585, 6588.39]
					},
					{
						x: new Date(1538868600000),
						y: [6587.6, 6598.21, 6587.6, 6594.27]
					},
					{
						x: new Date(1538870400000),
						y: [6596.44, 6601, 6590, 6596.55]
					},
					{
						x: new Date(1538872200000),
						y: [6598.91, 6605, 6596.61, 6600.02]
					},
					{
						x: new Date(1538874000000),
						y: [6600.55, 6605, 6589.14, 6593.01]
					},
					{
						x: new Date(1538875800000),
						y: [6593.15, 6605, 6592, 6603.06]
					},
					{
						x: new Date(1538877600000),
						y: [6603.07, 6604.5, 6599.09, 6603.89]
					},
					{
						x: new Date(1538879400000),
						y: [6604.44, 6604.44, 6600, 6603.5]
					},
					{
						x: new Date(1538881200000),
						y: [6603.5, 6603.99, 6597.5, 6603.86]
					},
					{
						x: new Date(1538883000000),
						y: [6603.85, 6605, 6600, 6604.07]
					},
					{
						x: new Date(1538884800000),
						y: [6604.98, 6606, 6604.07, 6606]
					},
				]
			}],
			chart: {
				height: 350,
				type: 'line',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				candlestick: {
					colors: {
						upward: "var(--clr-theme-primary)",
						downward: 'var(--clr-theme-secondary)'
					},
					wick: {
						useFillColor: true
					}
				}
			},
			stroke: {
				width: [3, 1]
			},
			tooltip: {
				shared: true,
				custom: [function ({ seriesIndex, dataPointIndex, w }) {
					return w.globals.series[seriesIndex][dataPointIndex]
				}, function ({ seriesIndex, dataPointIndex, w }) {
					var o = w.globals.seriesCandleO[seriesIndex][dataPointIndex]
					var h = w.globals.seriesCandleH[seriesIndex][dataPointIndex]
					var l = w.globals.seriesCandleL[seriesIndex][dataPointIndex]
					var c = w.globals.seriesCandleC[seriesIndex][dataPointIndex]
					return (
						''
					)
				}]
			},
			xaxis: {
				type: 'datetime'
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#candlestickCharts3"), options);
		chart.render();
	}
	/* Box Whisker Charts */
	if (jQuery("#boxWhiskerCharts").length > 0) {
		var options = {
			series: [
				{
					type: 'boxPlot',
					data: [
						{
							x: 'Jan 2015',
							y: [54, 66, 69, 75, 88]
						},
						{
							x: 'Jan 2016',
							y: [43, 65, 69, 76, 81]
						},
						{
							x: 'Jan 2017',
							y: [31, 39, 45, 51, 59]
						},
						{
							x: 'Jan 2018',
							y: [39, 46, 55, 65, 71]
						},
						{
							x: 'Jan 2019',
							y: [29, 31, 35, 39, 44]
						},
						{
							x: 'Jan 2020',
							y: [41, 49, 58, 61, 67]
						},
						{
							x: 'Jan 2021',
							y: [54, 59, 66, 71, 88]
						}
					]
				}
			],
			chart: {
				type: 'boxPlot',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				boxPlot: {
					colors: {
						upper: 'var(--clr-theme-primary)',
						lower: 'var(--clr-theme-secondary)'
					}
				}
			}
		};

		var chart = new ApexCharts(document.querySelector("#boxWhiskerCharts"), options);
		chart.render();
	}
	if (jQuery("#boxWhiskerCharts2").length > 0) {
		var options = {
			series: [
				{
					name: 'box',
					type: 'boxPlot',
					data: [
						{
							x: new Date('2017-01-01').getTime(),
							y: [54, 66, 69, 75, 88]
						},
						{
							x: new Date('2018-01-01').getTime(),
							y: [43, 65, 69, 76, 81]
						},
						{
							x: new Date('2019-01-01').getTime(),
							y: [31, 39, 45, 51, 59]
						},
						{
							x: new Date('2020-01-01').getTime(),
							y: [39, 46, 55, 65, 71]
						},
						{
							x: new Date('2021-01-01').getTime(),
							y: [29, 31, 35, 39, 44]
						}
					]
				},
				{
					name: 'outliers',
					type: 'scatter',
					data: [
						{
							x: new Date('2017-01-01').getTime(),
							y: 32
						},
						{
							x: new Date('2018-01-01').getTime(),
							y: 25
						},
						{
							x: new Date('2019-01-01').getTime(),
							y: 64
						},
						{
							x: new Date('2020-01-01').getTime(),
							y: 27
						},
						{
							x: new Date('2020-01-01').getTime(),
							y: 78
						},
						{
							x: new Date('2021-01-01').getTime(),
							y: 15
						}
					]
				}
			],
			chart: {
				type: 'boxPlot',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: ['var(--clr-theme-primary)', 'var(--clr-theme-secondary)'],
			xaxis: {
				type: 'datetime',
				tooltip: {
					formatter: function (val) {
						return new Date(val).getFullYear()
					}
				}
			},
			tooltip: {
				shared: false,
				intersect: true
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#boxWhiskerCharts2"), options);
		chart.render();
	}
	if (jQuery("#boxWhiskerCharts3").length > 0) {
		var options = {
			series: [
				{
					data: [
						{
							x: 'Category A',
							y: [54, 66, 69, 75, 88]
						},
						{
							x: 'Category B',
							y: [43, 65, 69, 76, 81]
						},
						{
							x: 'Category C',
							y: [31, 39, 45, 51, 59]
						},
						{
							x: 'Category D',
							y: [39, 46, 55, 65, 71]
						},
						{
							x: 'Category E',
							y: [29, 31, 35, 39, 44]
						},
						{
							x: 'Category F',
							y: [41, 49, 58, 61, 67]
						},
						{
							x: 'Category G',
							y: [54, 59, 66, 71, 88]
						}
					]
				}
			],
			chart: {
				type: 'boxPlot',
				height: 350,
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			plotOptions: {
				bar: {
					horizontal: true,
					barHeight: '50%'
				},
				boxPlot: {
					colors: {
						upper: 'var(--clr-theme-primary)',
						lower: 'var(--clr-theme-secondary)'
					}
				}
			},
			stroke: {
				colors: ['#6c757d']
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#boxWhiskerCharts3"), options);
		chart.render();
	}
	/* Pie Charts */
	if (jQuery("#pieCharts").length > 0) {
		var options = {
			series: [44, 55, 13, 43, 22],
			chart: {
				width: 380,
				type: 'pie',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			labels: ['Team A', 'Team B', 'Team C', 'Team D', 'Team E'],
			responsive: [{
				breakpoint: 480,
				options: {
					chart: {
						width: 200
					},
					legend: {
						position: 'bottom',
						labels: {
							colors: 'var(--clr-chart-1)',
							fontSize: '12px',
							fontFamily: 'var(--bd-fs-body)',
						},
					}
				}
			}],
		};

		var chart = new ApexCharts(document.querySelector("#pieCharts"), options);
		chart.render();
	}
	if (jQuery("#pieCharts2").length > 0) {

		var options = {
			series: [44, 55, 41, 17, 15],
			chart: {
				width: 380,
				type: 'donut',
				foreColor: 'var(--clr-chart-1)',
			},
			responsive: [{
				breakpoint: 480,
				options: {
					chart: {
						width: 200
					},
					legend: {
						position: 'bottom',
						labels: {
							colors: 'var(--clr-chart-1)',
							fontSize: '12px',
							fontFamily: 'var(--bd-fs-body)',
						},
					}
				}
			}],
		};
		var chart = new ApexCharts(document.querySelector("#pieCharts2"), options);
		chart.render();
	}
	if (jQuery("#pieCharts3").length > 0) {
		var options = {
			series: [44, 55, 41, 17, 15],
			chart: {
				width: 405,
				type: 'donut',
				foreColor: 'var(--clr-chart-1)',
			},
			plotOptions: {
				pie: {
					startAngle: -90,
					endAngle: 270
				}
			},
			dataLabels: {
				enabled: false
			},
			fill: {
				type: 'gradient',
			},
			legend: {
				formatter: function (val, opts) {
					return val + " - " + opts.w.globals.series[opts.seriesIndex]
				},
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			responsive: [{
				breakpoint: 480,
				options: {
					chart: {
						width: 200
					},
					legend: {
						position: 'bottom',
						labels: {
							colors: 'var(--clr-chart-1)',
							fontSize: '12px',
							fontFamily: 'var(--bd-fs-body)',
						},
					}
				}
			}],
		};
		var chart = new ApexCharts(document.querySelector("#pieCharts3"), options);
		chart.render();
	}
	/* Radial Bar Charts */
	if (jQuery("#apexRadialBarCharts").length > 0) {

		var options = {
			series: [70],
			chart: {
				height: 350,
				type: 'radialBar',
				foreColor: 'var(--clr-chart-1)',
			},
			plotOptions: {
				radialBar: {
					hollow: {
						size: '70%',
					}
				},
			},
			labels: ['Cricket'],
		};
		var chart = new ApexCharts(document.querySelector("#apexRadialBarCharts"), options);
		chart.render();
	}
	if (jQuery("#apexRadialBarCharts2").length > 0) {
		var options = {
			series: [44, 55, 67, 83],
			chart: {
				height: 350,
				type: 'radialBar',
				foreColor: 'var(--clr-chart-1)',
			},
			plotOptions: {
				radialBar: {
					dataLabels: {
						name: {
							fontSize: '22px',
						},
						value: {
							fontSize: '16px',
						},
						total: {
							show: true,
							label: 'Total',
							formatter: function (w) {
								/* By default this function returns the average of all series. The below is just an example to show the use of custom formatter function */
								return 249
							}
						}
					}
				}
			},
			labels: ['Apples', 'Oranges', 'Bananas', 'Berries'],
		};
		var chart = new ApexCharts(document.querySelector("#apexRadialBarCharts2"), options);
		chart.render();
	}
	if (jQuery("#apexRadialBarCharts3").length > 0) {
		var options = {
			series: [76],
			chart: {
				type: 'radialBar',
				offsetY: -20,
				foreColor: 'var(--clr-chart-1)',
				sparkline: {
					enabled: true
				}
			},
			plotOptions: {
				radialBar: {
					startAngle: -90,
					endAngle: 90,
					track: {
						background: "#e7e7e7",
						strokeWidth: '97%',
						margin: 5, /* margin is in pixels */
						dropShadow: {
							enabled: true,
							top: 2,
							left: 0,
							color: '#999',
							opacity: 1,
							blur: 2
						}
					},
					dataLabels: {
						name: {
							show: false
						},
						value: {
							offsetY: -2,
							fontSize: '22px'
						}
					}
				}
			},
			grid: {
				padding: {
					top: -10
				}
			},
			fill: {
				type: 'gradient',
				gradient: {
					shade: 'light',
					shadeIntensity: 0.4,
					inverseColors: false,
					opacityFrom: 1,
					opacityTo: 1,
					stops: [0, 50, 53, 91]
				},
			},
			labels: ['Average Results'],
		};
		var chart = new ApexCharts(document.querySelector("#apexRadialBarCharts3"), options);
		chart.render();
	}
	if (jQuery("#apexRadialBarCharts4").length > 0) {
		var options = {
			series: [76, 67, 61, 90],
			chart: {
				height: 390,
				type: 'radialBar',
				foreColor: 'var(--clr-chart-1)',
			},
			plotOptions: {
				radialBar: {
					offsetY: 0,
					startAngle: 0,
					endAngle: 270,
					hollow: {
						margin: 5,
						size: '30%',
						background: 'transparent',
						image: undefined,
					},
					dataLabels: {
						name: {
							show: false,
						},
						value: {
							show: false,
						}
					}
				}
			},
			colors: ['#1ab7ea', '#0084ff', '#39539E', '#0077B5'],
			labels: ['Vimeo', 'Messenger', 'Facebook', 'LinkedIn'],
			legend: {
				show: true,
				floating: true,
				fontSize: '16px',
				position: 'left',
				offsetX: 160,
				offsetY: 15,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
				markers: {
					size: 0
				},
				formatter: function (seriesName, opts) {
					return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
				},
				itemMargin: {
					vertical: 3
				}
			},
			responsive: [{
				breakpoint: 480,
				options: {
					legend: {
						show: false
					}
				}
			}]
		};
		var chart = new ApexCharts(document.querySelector("#apexRadialBarCharts4"), options);
		chart.render();
	}
	/* Radar Charts */
	if (jQuery("#radarCharts").length > 0) {
		var options = {
			series: [{
				name: 'Series 1',
				data: [80, 50, 30, 40, 100, 20],
			}],
			chart: {
				height: 350,
				type: 'radar',
				foreColor: 'var(--clr-chart-1)',
			},
			title: {
				text: 'Basic Radar Chart'
			},
			xaxis: {
				categories: ['January', 'February', 'March', 'April', 'May', 'June']
			}
		};

		var chart = new ApexCharts(document.querySelector("#radarCharts"), options);
		chart.render();
	}
	if (jQuery("#radarCharts2").length > 0) {

		var options = {
			series: [{
				name: 'Series 1',
				data: [80, 50, 30, 40, 100, 20],
			}, {
				name: 'Series 2',
				data: [20, 30, 40, 80, 20, 80],
			}, {
				name: 'Series 3',
				data: [44, 76, 78, 13, 43, 10],
			}],
			chart: {
				height: 350,
				type: 'radar',
				foreColor: 'var(--clr-chart-1)',
				dropShadow: {
					enabled: true,
					blur: 1,
					left: 1,
					top: 1
				}
			},
			title: {
				text: 'Radar Chart - Multi Series'
			},
			stroke: {
				width: 2
			},
			fill: {
				opacity: 0.1
			},
			markers: {
				size: 0
			},
			xaxis: {
				categories: ['2011', '2012', '2013', '2014', '2015', '2016']
			}
		};
		var chart = new ApexCharts(document.querySelector("#radarCharts2"), options);
		chart.render();
	}
	if (jQuery("#radarCharts3").length > 0) {
		var options = {
			series: [{
				name: 'Series 1',
				data: [20, 100, 40, 30, 50, 80, 33],
			}],
			chart: {
				height: 350,
				type: 'radar',
				foreColor: 'var(--clr-chart-1)',
			},
			dataLabels: {
				enabled: true
			},
			plotOptions: {
				radar: {
					size: 140,
					polygons: {
						strokeColors: '#e9e9e9',
						fill: {
							colors: ['#f8f8f8', '#fff']
						}
					}
				}
			},
			title: {
				text: 'Radar with Polygon Fill'
			},
			colors: ['#FF4560'],
			markers: {
				size: 4,
				colors: ['#fff'],
				strokeColor: '#FF4560',
				strokeWidth: 2,
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return val
					}
				}
			},
			xaxis: {
				categories: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
			},
			yaxis: {
				tickAmount: 7,
				labels: {
					formatter: function (val, i) {
						if (i % 2 === 0) {
							return val
						} else {
							return ''
						}
					}
				}
			}
		};

		var chart = new ApexCharts(document.querySelector("#radarCharts3"), options);
		chart.render();
	}
	/* Polar Area Charts */
	if (jQuery("#polarAreaCharts").length > 0) {
		var options = {
			series: [14, 23, 21, 17, 15, 10, 12, 17, 21],
			chart: {
				type: 'polarArea',
				foreColor: 'var(--clr-chart-1)',
			},
			stroke: {
				colors: ['#fff']
			},
			fill: {
				opacity: 0.8
			},
			responsive: [{
				breakpoint: 480,
				options: {
					chart: {
						width: 200
					},
					legend: {
						position: 'bottom'
					}
				}
			}],
			legend: {
				show: false,
				position: 'bottom',
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};
		var chart = new ApexCharts(document.querySelector("#polarAreaCharts"), options);
		chart.render();
	}
	if (jQuery("#polarAreaCharts2").length > 0) {
		var options = {
			series: [42, 47, 52, 58, 65],
			chart: {
				type: 'polarArea',
				foreColor: 'var(--clr-chart-1)',
			},

			labels: ['Rose A', 'Rose B', 'Rose C', 'Rose D', 'Rose E'],
			fill: {
				opacity: 1
			},
			stroke: {
				width: 1,
				colors: undefined
			},
			yaxis: {
				show: false
			},
			legend: {
				show: false,
				position: 'bottom'
			},
			plotOptions: {
				polarArea: {
					rings: {
						strokeWidth: 0
					},
					spokes: {
						strokeWidth: 0
					},
				}
			},
			theme: {
				monochrome: {
					enabled: true,
					shadeTo: 'light',
					shadeIntensity: 0.6
				}
			},
		};

		var chart = new ApexCharts(document.querySelector("#polarAreaCharts2"), options);
		chart.render();
	}
	/* treemapCharts */
	if (jQuery("#treemapCharts").length > 0) {
		var options = {
			series: [
				{
					data: [
						{
							x: 'New Delhi',
							y: 218
						},
						{
							x: 'Kolkata',
							y: 149
						},
						{
							x: 'Mumbai',
							y: 184
						},
						{
							x: 'Ahmedabad',
							y: 55
						},
						{
							x: 'Bangaluru',
							y: 84
						},
						{
							x: 'Pune',
							y: 31
						},
						{
							x: 'Chennai',
							y: 70
						},
						{
							x: 'Jaipur',
							y: 30
						},
						{
							x: 'Surat',
							y: 44
						},
						{
							x: 'Hyderabad',
							y: 68
						},
						{
							x: 'Lucknow',
							y: 28
						},
						{
							x: 'Indore',
							y: 19
						},
						{
							x: 'Kanpur',
							y: 29
						}
					]
				}
			],
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			chart: {
				height: 350,
				type: 'treemap',

				toolbar: {
					show: true
				}
			},
		};

		var chart = new ApexCharts(document.querySelector("#treemapCharts"), options);
		chart.render();
	}
	if (jQuery("#treemapCharts2").length > 0) {

		var options = {
			series: [
				{
					data: [
						{
							x: 'New Delhi',
							y: 218
						},
						{
							x: 'Kolkata',
							y: 149
						},
						{
							x: 'Mumbai',
							y: 184
						},
						{
							x: 'Ahmedabad',
							y: 55
						},
						{
							x: 'Bangaluru',
							y: 84
						},
						{
							x: 'Pune',
							y: 31
						},
						{
							x: 'Chennai',
							y: 70
						},
						{
							x: 'Jaipur',
							y: 30
						},
						{
							x: 'Surat',
							y: 44
						},
						{
							x: 'Hyderabad',
							y: 68
						},
						{
							x: 'Lucknow',
							y: 28
						},
						{
							x: 'Indore',
							y: 19
						},
						{
							x: 'Kanpur',
							y: 29
						}
					]
				}
			],
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			},
			chart: {
				height: 350,
				type: 'treemap',
				toolbar: {
					show: true
				}
			},
			colors: [
				'#3B93A5',
				'#F7B844',
				'#ADD8C7',
				'#EC3C65',
				'#CDD7B6',
				'#C1F666',
				'#D43F97',
				'#1E5D8C',
				'#421243',
				'#7F94B0',
				'#EF6537',
				'#C0ADDB'
			],
			plotOptions: {
				treemap: {
					distributed: true,
					enableShades: false
				}
			}
		};
		var chart = new ApexCharts(document.querySelector("#treemapCharts2"), options);
		chart.render();
	}
	/* heatmapCharts */
	if (jQuery("#heatmapCharts").length > 0) {
		function generateData(count, range) {
			var data = [];
			for (var i = 0; i < count; i++) {
				var randomValue = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
				data.push(randomValue);
			}
			return data;
		}

		var options = {
			series: [{
				name: 'Metric1',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric2',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric3',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric4',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric5',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric6',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric7',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric8',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric9',
				data: generateData(18, {
					min: 0,
					max: 90
				})
			}
			],
			chart: {
				height: 350,
				type: 'heatmap',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			dataLabels: {
				enabled: false
			},
			colors: ["var(--clr-chart-1)"],
		};
		var chart = new ApexCharts(document.querySelector("#heatmapCharts"), options);
		chart.render();
	}
	if (jQuery("#heatmapCharts2").length > 0) {
		function generateData(count, range) {
			var data = [];
			for (var i = 0; i < count; i++) {
				var randomValue = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
				data.push(randomValue);
			}
			return data;
		}
		var options = {
			series: [{
				name: 'Metric1',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric2',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric3',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric4',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric5',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric6',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric7',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric8',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			},
			{
				name: 'Metric8',
				data: generateData(20, {
					min: 0,
					max: 90
				})
			}
			],
			chart: {
				height: 350,
				type: 'heatmap',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			stroke: {
				width: 0
			},
			plotOptions: {
				heatmap: {
					radius: 30,
					enableShades: false,
					colorScale: {
						ranges: [{
							from: 0,
							to: 50,
							color: 'var(--clr-chart-1)'
						},
						{
							from: 51,
							to: 100,
							color: '#05C3FB'
						},
						],
					},

				}
			},
			dataLabels: {
				enabled: true,
				style: {
					colors: ['#fff']
				}
			},
			xaxis: {
				type: 'category',
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#heatmapCharts2"), options);
		chart.render();
	}
	/* bubbleCharts */
	function generateData(baseval, count, yrange) {
		var i = 0;
		var series = [];
		while (i < count) {
			var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
			var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
			var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

			series.push([baseval, x, y, z]);
			baseval += 86400000;
			i++;
		}
		return series;
	}
	/* Check if the element with ID bubbleCharts exists */
	if (jQuery("#bubbleCharts").length > 0) {
		var options = {
			series: [
				{
					name: 'Bubble1',
					data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
						min: 10,
						max: 60
					})
				},
				{
					name: 'Bubble2',
					data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
						min: 10,
						max: 60
					})
				},
				{
					name: 'Bubble3',
					data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
						min: 10,
						max: 60
					})
				},
				{
					name: 'Bubble4',
					data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
						min: 10,
						max: 60
					})
				}
			],
			chart: {
				height: 350,
				type: 'bubble',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			dataLabels: {
				enabled: false
			},
			fill: {
				opacity: 0.8
			},
			title: {
				text: 'Simple Bubble Chart'
			},
			xaxis: {
				tickAmount: 12,
				type: 'category',
			},
			yaxis: {
				max: 70
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#bubbleCharts"), options);
		chart.render();
	}
	if (jQuery("#bubbleCharts2").length > 0) {
		var options = {
			series: [{
				name: 'Product1',
				data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
					min: 10,
					max: 60
				})
			},
			{
				name: 'Product2',
				data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
					min: 10,
					max: 60
				})
			},
			{
				name: 'Product3',
				data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
					min: 10,
					max: 60
				})
			},
			{
				name: 'Product4',
				data: generateData(new Date('11 Feb 2017 GMT').getTime(), 20, {
					min: 10,
					max: 60
				})
			}],
			chart: {
				height: 350,
				type: 'bubble',
				foreColor: 'var(--clr-chart-1)',
				toolbar: {
					show: true
				}
			},
			colors: [
				'#3B93A5',
				'#F7B844',
				'#ADD8C7',
				'#EC3C65',
			],
			dataLabels: {
				enabled: false
			},
			fill: {
				type: 'gradient',
			},
			xaxis: {
				tickAmount: 12,
				type: 'datetime',
				labels: {
					rotate: 0,
				}
			},
			yaxis: {
				max: 70
			},
			theme: {
				palette: 'palette2'
			},
			legend: {
				show: true,
				labels: {
					colors: 'var(--clr-chart-1)',
					fontSize: '12px',
					fontFamily: 'var(--bd-fs-body)',
				},
			}
		};

		var chart = new ApexCharts(document.querySelector("#bubbleCharts2"), options);
		chart.render();
	}
	/* Scatter Charts */
	if (jQuery("#scatterCharts").length > 0) {

		var options = {
			series: [{
				name: "SAMPLE A",
				data: [
					[16.4, 5.4], [21.7, 2], [25.4, 3], [19, 2], [10.9, 1], [13.6, 3.2], [10.9, 7.4], [10.9, 0], [10.9, 8.2], [16.4, 0], [16.4, 1.8], [13.6, 0.3], [13.6, 0], [29.9, 0], [27.1, 2.3], [16.4, 0], [13.6, 3.7], [10.9, 5.2], [16.4, 6.5], [10.9, 0], [24.5, 7.1], [10.9, 0], [8.1, 4.7], [19, 0], [21.7, 1.8], [27.1, 0], [24.5, 0], [27.1, 0], [29.9, 1.5], [27.1, 0.8], [22.1, 2]]
			}, {
				name: "SAMPLE B",
				data: [
					[36.4, 13.4], [1.7, 11], [5.4, 8], [9, 17], [1.9, 4], [3.6, 12.2], [1.9, 14.4], [1.9, 9], [1.9, 13.2], [1.4, 7], [6.4, 8.8], [3.6, 4.3], [1.6, 10], [9.9, 2], [7.1, 15], [1.4, 0], [3.6, 13.7], [1.9, 15.2], [6.4, 16.5], [0.9, 10], [4.5, 17.1], [10.9, 10], [0.1, 14.7], [9, 10], [12.7, 11.8], [2.1, 10], [2.5, 10], [27.1, 10], [2.9, 11.5], [7.1, 10.8], [2.1, 12]]
			}, {
				name: "SAMPLE C",
				data: [
					[21.7, 3], [23.6, 3.5], [24.6, 3], [29.9, 3], [21.7, 20], [23, 2], [10.9, 3], [28, 4], [27.1, 0.3], [16.4, 4], [13.6, 0], [19, 5], [22.4, 3], [24.5, 3], [32.6, 3], [27.1, 4], [29.6, 6], [31.6, 8], [21.6, 5], [20.9, 4], [22.4, 0], [32.6, 10.3], [29.7, 20.8], [24.5, 0.8], [21.4, 0], [21.7, 6.9], [28.6, 7.7], [15.4, 0], [18.1, 0], [33.4, 0], [16.4, 0]]
			}],
			chart: {
				height: 350,
				type: 'scatter',
				foreColor: 'var(--clr-chart-1)',
				zoom: {
					enabled: true,
					type: 'xy'
				}
			},
			xaxis: {
				tickAmount: 10,
				labels: {
					formatter: function (val) {
						return parseFloat(val).toFixed(1)
					}
				}
			},
			yaxis: {
				tickAmount: 7
			}
		};

		var chart = new ApexCharts(document.querySelector("#scatterCharts"), options);
		chart.render();
	}
	/* Function to generate day-wise time series data for scatter chart */
	function generateDayWiseTimeSeries(baseval, count, yrange) {
		var i = 0;
		var series = [];
		while (i < count) {
			var x = baseval;
			var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;

			series.push([x, y]);
			baseval += 86400000; /* Adding one day in milliseconds */
			i++;
		}
		return series;
	}
	/* Check if the element with ID scatterCharts2 exists */
	if (jQuery("#scatterCharts2").length > 0) {
		var options = {
			series: [
				{
					name: 'TEAM 1',
					data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
						min: 10,
						max: 60
					})
				},
				{
					name: 'TEAM 2',
					data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
						min: 10,
						max: 60
					})
				},
				{
					name: 'TEAM 3',
					data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 30, {
						min: 10,
						max: 60
					})
				},
				{
					name: 'TEAM 4',
					data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 10, {
						min: 10,
						max: 60
					})
				},
				{
					name: 'TEAM 5',
					data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 30, {
						min: 10,
						max: 60
					})
				}
			],
			chart: {
				height: 350,
				type: 'scatter',
				foreColor: 'var(--clr-chart-1)',
				zoom: {
					type: 'xy'
				}
			},
			dataLabels: {
				enabled: false
			},
			grid: {
				xaxis: {
					lines: {
						show: true
					}
				},
				yaxis: {
					lines: {
						show: true
					}
				},
			},
			xaxis: {
				type: 'datetime',
			},
			yaxis: {
				max: 70
			}
		};

		var chart = new ApexCharts(document.querySelector("#scatterCharts2"), options);
		chart.render();
	}
})(jQuery);