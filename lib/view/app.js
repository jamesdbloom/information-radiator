((() => {
    'use strict';

    var pollPeriod = 5;

    function update() {
        function cleanStatus($element) {
            $element.empty();
            $element.removeClass('good');
            $element.removeClass('bad');
            $element.removeClass('unknown');
        }

        function fail(status, $element, value) {
            $element.append((value ? "<p class='content'>" + value + "</p>" : "") + ($element.attr('data-last-success') ? "<p class='last_success'>last success:<br/>" + $element.attr('data-last-success') + "</p>" : ""));
            $element.addClass(status);
        }

        $(".stage").each(function () {
            var $element = $(this);

            $.post("/data.json", JSON.stringify({
                url: $element.attr('data-url'),
                path: $element.attr('data-path'),
                expression: $element.attr('data-expression'),
                condition: $element.attr('data-condition-value') && ($element.attr('data-condition-expression') || $element.attr('data-condition-path')) && {
                    path: $element.attr('data-condition-path'),
                    expression: $element.attr('data-condition-expression'),
                    value: $element.attr('data-condition-value')
                }
            })).done(data => {
                cleanStatus($element);
                if (data && data.value) {
                    if (data.match) {
                        $element.append("<p class='content'>" + data.value + "</p>");
                        $element.attr('data-last-success', data.value);
                        $element.addClass('good');
                    } else {
                        fail('bad', $element, data.value);
                    }
                } else {
                    fail('unknown', $element, '&nbsp;');
                }
            }).fail(() => {
                cleanStatus($element);
                fail('bad', $element, '&nbsp;');
            });
        });
    }

    function poll() {
        update();
        setTimeout(poll, pollPeriod * 1000);
    }


    $.ajax({
        url: "/pipelines.json",
        success(data) {

            pollPeriod = data.pollPeriod || pollPeriod;
            var groups = _.reduce(data.groups,
                (memo, group) => memo + "<fieldset class='group'>" + (group.name ? "<legend>" + group.name + "</legend>" : "") +
                    "<div class='headers'>" + _.reduce(group.headers,
                    (memo, header) => memo +
                        "<div class='header' style='width: 20%'>" + header + "</div>", '') + "</div>" +
                    _.reduce(group.pipelines,
                        (memo, pipeline) => memo + "<div class='pipeline'>" + _.reduce(pipeline.stages,
                            (memo, stage) => memo +
                                "<div class='stage" + (stage.link ? " clickable' onclick=\"location.href='" + stage.link + "'\"" : "' ") + " style='width: 20%' data-url='" + stage.url + "'" +
                                (stage.path ? "data-path='" + stage.path + "'" : "") +
                                (stage.expression ? "data-expression='" + stage.expression + "'" : "") +
                                (stage.condition && stage.condition.path ? "data-condition-path='" + stage.condition.path + "'" : "") +
                                (stage.condition && stage.condition.expression ? "data-condition-expression='" + stage.condition.expression + "'" : "") +
                                (stage.condition && stage.condition.value ? "data-condition-value='" + stage.condition.value + "'" : "") +
                                "><p class='content'>&nbsp;</p>" +
                                "</div>", '') + "</div>", '') + "</fieldset>", '');
            var pipelines = _.reduce(data.pipelines,
                (memo, pipeline) => memo + "<div class='pipeline'>" + _.reduce(pipeline.stages,
                    (memo, stage) => memo +
                        "<div class='stage' style='width: 20%' data-url='" + stage.url + "'" +
                        (stage.path ? "data-path='" + stage.path + "'" : "") +
                        (stage.expression ? "data-expression='" + stage.expression + "'" : "") +
                        "><p>" + stage.name + "</p><p class='content'></p></div>", '') + "</div>", '');

            var $pipelines = $("#pipelines");
            if (data.title) {
                $pipelines.before("<h1>" + data.title + "</h1>");
            }
            $pipelines.html(groups + pipelines);
            if (data.refresh) {
                $('body').append('<a id="refresh" class="button clickable" href="#"></a>');
                $("#refresh").click(update);
            }
            poll();
        }
    });

})());