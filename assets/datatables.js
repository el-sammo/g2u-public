(function($) {
	var app = angular.module('app');

	app.factory('datatables', function datatablesFactory($window) {
		var service = {
			build: function($scope, config, override) {
				override || (override = {});
				config || (config = {});
				config.cols || (config.cols = []);
				config.id || (config.id = randomId());
				config.selector || (config.selector = '#' + config.id);
				config.template || (config.template = '/templates/datatables.html');

				var hasRendered = false;
				config.render || (config.render = function() {
					if(hasRendered) return;

					var $dt = $(config.selector);
					if($dt.length < 1) return;
					$dt.DataTable(options);

					if(! config.height) {
						resizeDataTables();
					}
					hasRendered = true;

					return 'fms-ignore';
				});

				$scope.datatables = config;

				var NA = '<span class="label label-custom text-muted">N/A</span>';
				var options = {
					ajax: {
						url: config.ajax,
						error: handleError($window)
					},
					scrollY: config.height || tableHeight(),
					columns: [],
					order: [[1, 'asc']],
					columnDefs: [
						{
							render: function(data, type, row) {
								return buildActions(config, data, type, row);
							},
							targets: 0
						},
						{ sWidth: '100px', aTargets: [ 0 ] },
						{ bSortable: false, aTargets: [ 0 ] },
						{ data: null, defaultContent: NA, targets: '_all' }
					]
				};

				var idx = 0;
				config.cols.forEach(function(col) {
					options.columns.push({data: col.data});

					// Add render transformations for special data types
					if(col.type && typeHandlers[col.type]) {
						typeHandlers[col.type](idx, options, config);
					}
					idx++;
				});

				$.extend( options, override );
			}
		};

		return service;
	});


	///
	// Default configuration
	///

	$.extend( $.fn.dataTable.defaults, {
		serverSide: true,
		scrollCollapse: true,
		iDisplayLength: 10,

		// See: http://www.datatables.net/examples/basic_init/dom.html
		//
		// l - Length changing
		// f - Filtering input
		// t - The Table!
		// i - Information
		// p - Pagination
		// r - pRocessing
		// < and > - div elements
		// <"#id" and > - div with an id
		// <"class" and > - div with a class
		// <"#id.class" and > - div with an id and class
		//
		// dom: (
		//	 '<"row"<"col-sm-6"l><"col-sm-6"f>><"row"<"col-sm-12"tr>>' +
		//	 '<"row"<"col-sm-6"i><"col-sm-6"p>>'
		// )
		dom: (
			'<"row"<"col-sm-6"l><"col-sm-6"f>><"row"<"col-sm-12"tr>>' +
			'<"navbar navbar-default navbar-fixed-bottom"<"container-fluid"' +
			'<"col-sm-6"i><"col-sm-6"p>>>'
		)
	});


	///
	// Misc helpers
	///

	function buildActions(config, data, type, row) {
		var actionHtml = '';

		if(! config.actions) return actionHtml;

		config.actions.forEach(function(action) {
			actionHtml += (
				'<a href="' + action.url + data + '">' +
					'<button class="btn btn-default ' + 
						(action.css ? action.css : '') + '">'
						+ action.content +
					'</button>' +
				'</a>'
			);
		});
		return actionHtml;
	}

	function randomId() {
		var low = 100000;
		var high = 999999;
		return 'datatable-' + Math.floor(Math.random() * (high - low) + low);
	}


	///
	// Error handling
	///

	function handleError($window) {
		return function onError(jqXHR, textStatus, err) {
			var res = jqXHR.responseJSON;
			if(res.notAuthenticated) {
				$window.location.href = '/login';
			}
		};
	}


	///
	// Data formatting / transformations
	///

	var typeHandlers = {
		time: function(idx, options) {
			options.columnDefs.push({
				render: formatTime,
				targets: idx
			});
		}
	};

	function formatTime(data, type, row) {
		var time = moment(data);
		if(! time.isValid()) return data;

		return (
			time.format('MM/DD/YYYY h:mm a') +
			'<span class="label label-custom text-muted fms-time">' +
				time.fromNow() +
			'</span>'
		);
	}


	///
	// Dynamic vertical sizing
	///

	function resizeDataTables() {
		setTimeout(function() {
			var tables = $.fn.dataTable.fnTables(true);
			tables.forEach(function(table) {
				var dynamicHeight = tableHeight();
				var $table = $(table).dataTable();
				$table.fnSettings().oScroll.sY = dynamicHeight;
				$table.fnDraw();
			})
		}, 10);
	};

	function tableHeight() {
		return $(window).height() - 330;
	};

	$(window).resize(resizeDataTables);

})(jQuery);
