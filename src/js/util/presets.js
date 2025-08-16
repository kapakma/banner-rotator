//add effect presets
export function addPresets(presets, effects, directions, orders) {
    $.each(effects, function(i, effect) {
        $.each(directions, function(j, direction) {
            $.each(orders, function(k, order) {
                presets.push({ effect: effect, direction: direction, order: order });
            });
        });
    });
}

const PRESETS = {};

(function() {
    const empty = [''],
        xDirs = ['left', 'right'],
        yDirs = ['up', 'down'],
        order = ['downLeft', 'upRight', 'downRight', 'upLeft', 'spiralIn', 'spiralOut', 'zigZagDown', 'zigZagUp', 'zigZagRight', 'zigZagLeft'];
    
    $.each(['none', 'column', 'row', 'grid'], function(i, val) {
        PRESETS[val] = [];
    });

    addPresets(PRESETS.none, ['cover', 'flip', 'push', 'rotate'], xDirs.concat(yDirs), empty);
    addPresets(PRESETS.none, ['fade', 'zoom'], empty, empty);
    
    addPresets(PRESETS.column, ['fade', 'zoom'], empty, xDirs);
    addPresets(PRESETS.column, ['push', 'rotate'], yDirs, xDirs);
    $.each(xDirs, function(i, val) {
        addPresets(PRESETS.column, ['cover', 'flip', 'move'], [val], [val]);
    });
    
    addPresets(PRESETS.row, ['fade', 'zoom'], empty, yDirs);
    addPresets(PRESETS.row, ['push', 'rotate'], xDirs, yDirs);
    $.each(yDirs, function(i, val) {
        addPresets(PRESETS.row, ['cover', 'flip', 'move'], [val], [val]);
    });

    addPresets(PRESETS.grid, ['expand', 'fade', 'zoom'], empty, order);
    addPresets(PRESETS.grid, ['cover', 'flip', 'move', 'push'], ['random'], order);
}());

export default PRESETS;