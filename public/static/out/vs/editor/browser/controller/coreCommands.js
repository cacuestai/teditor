/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "vs/nls", "vs/base/common/types", "vs/editor/browser/editorExtensions", "vs/editor/browser/services/codeEditorService", "vs/editor/common/controller/cursorColumnSelection", "vs/editor/common/controller/cursorCommon", "vs/editor/common/controller/cursorDeleteOperations", "vs/editor/common/controller/cursorMoveCommands", "vs/editor/common/controller/cursorTypeOperations", "vs/editor/common/core/position", "vs/editor/common/core/range", "vs/editor/common/editorContextKeys", "vs/platform/contextkey/common/contextkey", "vs/platform/keybinding/common/keybindingsRegistry"], function (require, exports, nls, types, editorExtensions_1, codeEditorService_1, cursorColumnSelection_1, cursorCommon_1, cursorDeleteOperations_1, cursorMoveCommands_1, cursorTypeOperations_1, position_1, range_1, editorContextKeys_1, contextkey_1, keybindingsRegistry_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CoreEditingCommands = exports.CoreNavigationCommands = exports.RevealLine_ = exports.EditorScroll_ = exports.CoreEditorCommand = void 0;
    const CORE_WEIGHT = 0 /* EditorCore */;
    class CoreEditorCommand extends editorExtensions_1.EditorCommand {
        runEditorCommand(accessor, editor, args) {
            const viewModel = editor._getViewModel();
            if (!viewModel) {
                // the editor has no view => has no cursors
                return;
            }
            this.runCoreEditorCommand(viewModel, args || {});
        }
    }
    exports.CoreEditorCommand = CoreEditorCommand;
    var EditorScroll_;
    (function (EditorScroll_) {
        const isEditorScrollArgs = function (arg) {
            if (!types.isObject(arg)) {
                return false;
            }
            const scrollArg = arg;
            if (!types.isString(scrollArg.to)) {
                return false;
            }
            if (!types.isUndefined(scrollArg.by) && !types.isString(scrollArg.by)) {
                return false;
            }
            if (!types.isUndefined(scrollArg.value) && !types.isNumber(scrollArg.value)) {
                return false;
            }
            if (!types.isUndefined(scrollArg.revealCursor) && !types.isBoolean(scrollArg.revealCursor)) {
                return false;
            }
            return true;
        };
        EditorScroll_.description = {
            description: 'Scroll editor in the given direction',
            args: [
                {
                    name: 'Editor scroll argument object',
                    description: `Property-value pairs that can be passed through this argument:
					* 'to': A mandatory direction value.
						\`\`\`
						'up', 'down'
						\`\`\`
					* 'by': Unit to move. Default is computed based on 'to' value.
						\`\`\`
						'line', 'wrappedLine', 'page', 'halfPage'
						\`\`\`
					* 'value': Number of units to move. Default is '1'.
					* 'revealCursor': If 'true' reveals the cursor if it is outside view port.
				`,
                    constraint: isEditorScrollArgs,
                    schema: {
                        'type': 'object',
                        'required': ['to'],
                        'properties': {
                            'to': {
                                'type': 'string',
                                'enum': ['up', 'down']
                            },
                            'by': {
                                'type': 'string',
                                'enum': ['line', 'wrappedLine', 'page', 'halfPage']
                            },
                            'value': {
                                'type': 'number',
                                'default': 1
                            },
                            'revealCursor': {
                                'type': 'boolean',
                            }
                        }
                    }
                }
            ]
        };
        /**
         * Directions in the view for editor scroll command.
         */
        EditorScroll_.RawDirection = {
            Up: 'up',
            Down: 'down',
        };
        /**
         * Units for editor scroll 'by' argument
         */
        EditorScroll_.RawUnit = {
            Line: 'line',
            WrappedLine: 'wrappedLine',
            Page: 'page',
            HalfPage: 'halfPage'
        };
        function parse(args) {
            let direction;
            switch (args.to) {
                case EditorScroll_.RawDirection.Up:
                    direction = 1 /* Up */;
                    break;
                case EditorScroll_.RawDirection.Down:
                    direction = 2 /* Down */;
                    break;
                default:
                    // Illegal arguments
                    return null;
            }
            let unit;
            switch (args.by) {
                case EditorScroll_.RawUnit.Line:
                    unit = 1 /* Line */;
                    break;
                case EditorScroll_.RawUnit.WrappedLine:
                    unit = 2 /* WrappedLine */;
                    break;
                case EditorScroll_.RawUnit.Page:
                    unit = 3 /* Page */;
                    break;
                case EditorScroll_.RawUnit.HalfPage:
                    unit = 4 /* HalfPage */;
                    break;
                default:
                    unit = 2 /* WrappedLine */;
            }
            const value = Math.floor(args.value || 1);
            const revealCursor = !!args.revealCursor;
            return {
                direction: direction,
                unit: unit,
                value: value,
                revealCursor: revealCursor,
                select: (!!args.select)
            };
        }
        EditorScroll_.parse = parse;
        let Direction;
        (function (Direction) {
            Direction[Direction["Up"] = 1] = "Up";
            Direction[Direction["Down"] = 2] = "Down";
        })(Direction = EditorScroll_.Direction || (EditorScroll_.Direction = {}));
        let Unit;
        (function (Unit) {
            Unit[Unit["Line"] = 1] = "Line";
            Unit[Unit["WrappedLine"] = 2] = "WrappedLine";
            Unit[Unit["Page"] = 3] = "Page";
            Unit[Unit["HalfPage"] = 4] = "HalfPage";
        })(Unit = EditorScroll_.Unit || (EditorScroll_.Unit = {}));
    })(EditorScroll_ = exports.EditorScroll_ || (exports.EditorScroll_ = {}));
    var RevealLine_;
    (function (RevealLine_) {
        const isRevealLineArgs = function (arg) {
            if (!types.isObject(arg)) {
                return false;
            }
            const reveaLineArg = arg;
            if (!types.isNumber(reveaLineArg.lineNumber)) {
                return false;
            }
            if (!types.isUndefined(reveaLineArg.at) && !types.isString(reveaLineArg.at)) {
                return false;
            }
            return true;
        };
        RevealLine_.description = {
            description: 'Reveal the given line at the given logical position',
            args: [
                {
                    name: 'Reveal line argument object',
                    description: `Property-value pairs that can be passed through this argument:
					* 'lineNumber': A mandatory line number value.
					* 'at': Logical position at which line has to be revealed .
						\`\`\`
						'top', 'center', 'bottom'
						\`\`\`
				`,
                    constraint: isRevealLineArgs,
                    schema: {
                        'type': 'object',
                        'required': ['lineNumber'],
                        'properties': {
                            'lineNumber': {
                                'type': 'number',
                            },
                            'at': {
                                'type': 'string',
                                'enum': ['top', 'center', 'bottom']
                            }
                        }
                    }
                }
            ]
        };
        /**
         * Values for reveal line 'at' argument
         */
        RevealLine_.RawAtArgument = {
            Top: 'top',
            Center: 'center',
            Bottom: 'bottom'
        };
    })(RevealLine_ = exports.RevealLine_ || (exports.RevealLine_ = {}));
    class EditorOrNativeTextInputCommand {
        constructor(target) {
            // 1. handle case when focus is in editor.
            target.addImplementation(10000, (accessor, args) => {
                // Only if editor text focus (i.e. not if editor has widget focus).
                const focusedEditor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
                if (focusedEditor && focusedEditor.hasTextFocus()) {
                    this.runEditorCommand(accessor, focusedEditor, args);
                    return true;
                }
                return false;
            });
            // 2. handle case when focus is in some other `input` / `textarea`.
            target.addImplementation(1000, (accessor, args) => {
                // Only if focused on an element that allows for entering text
                const activeElement = document.activeElement;
                if (activeElement && ['input', 'textarea'].indexOf(activeElement.tagName.toLowerCase()) >= 0) {
                    this.runDOMCommand();
                    return true;
                }
                return false;
            });
            // 3. (default) handle case when focus is somewhere else.
            target.addImplementation(0, (accessor, args) => {
                // Redirecting to active editor
                const activeEditor = accessor.get(codeEditorService_1.ICodeEditorService).getActiveCodeEditor();
                if (activeEditor) {
                    activeEditor.focus();
                    this.runEditorCommand(accessor, activeEditor, args);
                    return true;
                }
                return false;
            });
        }
    }
    var CoreNavigationCommands;
    (function (CoreNavigationCommands) {
        class BaseMoveToCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.moveTo(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args.position, args.viewPosition)
                ]);
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.MoveTo = editorExtensions_1.registerEditorCommand(new BaseMoveToCommand({
            id: '_moveTo',
            inSelectionMode: false,
            precondition: undefined
        }));
        CoreNavigationCommands.MoveToSelect = editorExtensions_1.registerEditorCommand(new BaseMoveToCommand({
            id: '_moveToSelect',
            inSelectionMode: true,
            precondition: undefined
        }));
        class ColumnSelectCommand extends CoreEditorCommand {
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                const result = this._getColumnSelectResult(viewModel, viewModel.getPrimaryCursorState(), viewModel.getCursorColumnSelectData(), args);
                viewModel.setCursorStates(args.source, 3 /* Explicit */, result.viewStates.map((viewState) => cursorCommon_1.CursorState.fromViewState(viewState)));
                viewModel.setCursorColumnSelectData({
                    isReal: true,
                    fromViewLineNumber: result.fromLineNumber,
                    fromViewVisualColumn: result.fromVisualColumn,
                    toViewLineNumber: result.toLineNumber,
                    toViewVisualColumn: result.toVisualColumn
                });
                if (result.reversed) {
                    viewModel.revealTopMostCursor(args.source);
                }
                else {
                    viewModel.revealBottomMostCursor(args.source);
                }
            }
        }
        CoreNavigationCommands.ColumnSelect = editorExtensions_1.registerEditorCommand(new class extends ColumnSelectCommand {
            constructor() {
                super({
                    id: 'columnSelect',
                    precondition: undefined
                });
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                // validate `args`
                const validatedPosition = viewModel.model.validatePosition(args.position);
                const validatedViewPosition = viewModel.coordinatesConverter.validateViewPosition(new position_1.Position(args.viewPosition.lineNumber, args.viewPosition.column), validatedPosition);
                let fromViewLineNumber = args.doColumnSelect ? prevColumnSelectData.fromViewLineNumber : validatedViewPosition.lineNumber;
                let fromViewVisualColumn = args.doColumnSelect ? prevColumnSelectData.fromViewVisualColumn : args.mouseColumn - 1;
                return cursorColumnSelection_1.ColumnSelection.columnSelect(viewModel.cursorConfig, viewModel, fromViewLineNumber, fromViewVisualColumn, validatedViewPosition.lineNumber, args.mouseColumn - 1);
            }
        });
        CoreNavigationCommands.CursorColumnSelectLeft = editorExtensions_1.registerEditorCommand(new class extends ColumnSelectCommand {
            constructor() {
                super({
                    id: 'cursorColumnSelectLeft',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 15 /* LeftArrow */,
                        linux: { primary: 0 }
                    }
                });
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                return cursorColumnSelection_1.ColumnSelection.columnSelectLeft(viewModel.cursorConfig, viewModel, prevColumnSelectData);
            }
        });
        CoreNavigationCommands.CursorColumnSelectRight = editorExtensions_1.registerEditorCommand(new class extends ColumnSelectCommand {
            constructor() {
                super({
                    id: 'cursorColumnSelectRight',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 17 /* RightArrow */,
                        linux: { primary: 0 }
                    }
                });
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                return cursorColumnSelection_1.ColumnSelection.columnSelectRight(viewModel.cursorConfig, viewModel, prevColumnSelectData);
            }
        });
        class ColumnSelectUpCommand extends ColumnSelectCommand {
            constructor(opts) {
                super(opts);
                this._isPaged = opts.isPaged;
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                return cursorColumnSelection_1.ColumnSelection.columnSelectUp(viewModel.cursorConfig, viewModel, prevColumnSelectData, this._isPaged);
            }
        }
        CoreNavigationCommands.CursorColumnSelectUp = editorExtensions_1.registerEditorCommand(new ColumnSelectUpCommand({
            isPaged: false,
            id: 'cursorColumnSelectUp',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 16 /* UpArrow */,
                linux: { primary: 0 }
            }
        }));
        CoreNavigationCommands.CursorColumnSelectPageUp = editorExtensions_1.registerEditorCommand(new ColumnSelectUpCommand({
            isPaged: true,
            id: 'cursorColumnSelectPageUp',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 11 /* PageUp */,
                linux: { primary: 0 }
            }
        }));
        class ColumnSelectDownCommand extends ColumnSelectCommand {
            constructor(opts) {
                super(opts);
                this._isPaged = opts.isPaged;
            }
            _getColumnSelectResult(viewModel, primary, prevColumnSelectData, args) {
                return cursorColumnSelection_1.ColumnSelection.columnSelectDown(viewModel.cursorConfig, viewModel, prevColumnSelectData, this._isPaged);
            }
        }
        CoreNavigationCommands.CursorColumnSelectDown = editorExtensions_1.registerEditorCommand(new ColumnSelectDownCommand({
            isPaged: false,
            id: 'cursorColumnSelectDown',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 18 /* DownArrow */,
                linux: { primary: 0 }
            }
        }));
        CoreNavigationCommands.CursorColumnSelectPageDown = editorExtensions_1.registerEditorCommand(new ColumnSelectDownCommand({
            isPaged: true,
            id: 'cursorColumnSelectPageDown',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 512 /* Alt */ | 12 /* PageDown */,
                linux: { primary: 0 }
            }
        }));
        class CursorMoveImpl extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'cursorMove',
                    precondition: undefined,
                    description: cursorMoveCommands_1.CursorMove.description
                });
            }
            runCoreEditorCommand(viewModel, args) {
                const parsed = cursorMoveCommands_1.CursorMove.parse(args);
                if (!parsed) {
                    // illegal arguments
                    return;
                }
                this._runCursorMove(viewModel, args.source, parsed);
            }
            _runCursorMove(viewModel, source, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(source, 3 /* Explicit */, CursorMoveImpl._move(viewModel, viewModel.getCursorStates(), args));
                viewModel.revealPrimaryCursor(source, true);
            }
            static _move(viewModel, cursors, args) {
                const inSelectionMode = args.select;
                const value = args.value;
                switch (args.direction) {
                    case 0 /* Left */:
                    case 1 /* Right */:
                    case 2 /* Up */:
                    case 3 /* Down */:
                    case 4 /* WrappedLineStart */:
                    case 5 /* WrappedLineFirstNonWhitespaceCharacter */:
                    case 6 /* WrappedLineColumnCenter */:
                    case 7 /* WrappedLineEnd */:
                    case 8 /* WrappedLineLastNonWhitespaceCharacter */:
                        return cursorMoveCommands_1.CursorMoveCommands.simpleMove(viewModel, cursors, args.direction, inSelectionMode, value, args.unit);
                    case 9 /* ViewPortTop */:
                    case 11 /* ViewPortBottom */:
                    case 10 /* ViewPortCenter */:
                    case 12 /* ViewPortIfOutside */:
                        return cursorMoveCommands_1.CursorMoveCommands.viewportMove(viewModel, cursors, args.direction, inSelectionMode, value);
                }
                return null;
            }
        }
        CoreNavigationCommands.CursorMoveImpl = CursorMoveImpl;
        CoreNavigationCommands.CursorMove = editorExtensions_1.registerEditorCommand(new CursorMoveImpl());
        let Constants;
        (function (Constants) {
            Constants[Constants["PAGE_SIZE_MARKER"] = -1] = "PAGE_SIZE_MARKER";
        })(Constants || (Constants = {}));
        class CursorMoveBasedCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._staticArgs = opts.args;
            }
            runCoreEditorCommand(viewModel, dynamicArgs) {
                let args = this._staticArgs;
                if (this._staticArgs.value === -1 /* PAGE_SIZE_MARKER */) {
                    // -1 is a marker for page size
                    args = {
                        direction: this._staticArgs.direction,
                        unit: this._staticArgs.unit,
                        select: this._staticArgs.select,
                        value: viewModel.cursorConfig.pageSize
                    };
                }
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(dynamicArgs.source, 3 /* Explicit */, cursorMoveCommands_1.CursorMoveCommands.simpleMove(viewModel, viewModel.getCursorStates(), args.direction, args.select, args.value, args.unit));
                viewModel.revealPrimaryCursor(dynamicArgs.source, true);
            }
        }
        CoreNavigationCommands.CursorLeft = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 0 /* Left */,
                unit: 0 /* None */,
                select: false,
                value: 1
            },
            id: 'cursorLeft',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 15 /* LeftArrow */,
                mac: { primary: 15 /* LeftArrow */, secondary: [256 /* WinCtrl */ | 32 /* KEY_B */] }
            }
        }));
        CoreNavigationCommands.CursorLeftSelect = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 0 /* Left */,
                unit: 0 /* None */,
                select: true,
                value: 1
            },
            id: 'cursorLeftSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* Shift */ | 15 /* LeftArrow */
            }
        }));
        CoreNavigationCommands.CursorRight = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 1 /* Right */,
                unit: 0 /* None */,
                select: false,
                value: 1
            },
            id: 'cursorRight',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 17 /* RightArrow */,
                mac: { primary: 17 /* RightArrow */, secondary: [256 /* WinCtrl */ | 36 /* KEY_F */] }
            }
        }));
        CoreNavigationCommands.CursorRightSelect = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 1 /* Right */,
                unit: 0 /* None */,
                select: true,
                value: 1
            },
            id: 'cursorRightSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* Shift */ | 17 /* RightArrow */
            }
        }));
        CoreNavigationCommands.CursorUp = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 2 /* Up */,
                unit: 2 /* WrappedLine */,
                select: false,
                value: 1
            },
            id: 'cursorUp',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 16 /* UpArrow */,
                mac: { primary: 16 /* UpArrow */, secondary: [256 /* WinCtrl */ | 46 /* KEY_P */] }
            }
        }));
        CoreNavigationCommands.CursorUpSelect = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 2 /* Up */,
                unit: 2 /* WrappedLine */,
                select: true,
                value: 1
            },
            id: 'cursorUpSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* Shift */ | 16 /* UpArrow */,
                secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */],
                mac: { primary: 1024 /* Shift */ | 16 /* UpArrow */ },
                linux: { primary: 1024 /* Shift */ | 16 /* UpArrow */ }
            }
        }));
        CoreNavigationCommands.CursorPageUp = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 2 /* Up */,
                unit: 2 /* WrappedLine */,
                select: false,
                value: -1 /* PAGE_SIZE_MARKER */
            },
            id: 'cursorPageUp',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 11 /* PageUp */
            }
        }));
        CoreNavigationCommands.CursorPageUpSelect = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 2 /* Up */,
                unit: 2 /* WrappedLine */,
                select: true,
                value: -1 /* PAGE_SIZE_MARKER */
            },
            id: 'cursorPageUpSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* Shift */ | 11 /* PageUp */
            }
        }));
        CoreNavigationCommands.CursorDown = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 3 /* Down */,
                unit: 2 /* WrappedLine */,
                select: false,
                value: 1
            },
            id: 'cursorDown',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 18 /* DownArrow */,
                mac: { primary: 18 /* DownArrow */, secondary: [256 /* WinCtrl */ | 44 /* KEY_N */] }
            }
        }));
        CoreNavigationCommands.CursorDownSelect = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 3 /* Down */,
                unit: 2 /* WrappedLine */,
                select: true,
                value: 1
            },
            id: 'cursorDownSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* Shift */ | 18 /* DownArrow */,
                secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */],
                mac: { primary: 1024 /* Shift */ | 18 /* DownArrow */ },
                linux: { primary: 1024 /* Shift */ | 18 /* DownArrow */ }
            }
        }));
        CoreNavigationCommands.CursorPageDown = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 3 /* Down */,
                unit: 2 /* WrappedLine */,
                select: false,
                value: -1 /* PAGE_SIZE_MARKER */
            },
            id: 'cursorPageDown',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 12 /* PageDown */
            }
        }));
        CoreNavigationCommands.CursorPageDownSelect = editorExtensions_1.registerEditorCommand(new CursorMoveBasedCommand({
            args: {
                direction: 3 /* Down */,
                unit: 2 /* WrappedLine */,
                select: true,
                value: -1 /* PAGE_SIZE_MARKER */
            },
            id: 'cursorPageDownSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* Shift */ | 12 /* PageDown */
            }
        }));
        CoreNavigationCommands.CreateCursor = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'createCursor',
                    precondition: undefined
                });
            }
            runCoreEditorCommand(viewModel, args) {
                let newState;
                if (args.wholeLine) {
                    newState = cursorMoveCommands_1.CursorMoveCommands.line(viewModel, viewModel.getPrimaryCursorState(), false, args.position, args.viewPosition);
                }
                else {
                    newState = cursorMoveCommands_1.CursorMoveCommands.moveTo(viewModel, viewModel.getPrimaryCursorState(), false, args.position, args.viewPosition);
                }
                const states = viewModel.getCursorStates();
                // Check if we should remove a cursor (sort of like a toggle)
                if (states.length > 1) {
                    const newModelPosition = (newState.modelState ? newState.modelState.position : null);
                    const newViewPosition = (newState.viewState ? newState.viewState.position : null);
                    for (let i = 0, len = states.length; i < len; i++) {
                        const state = states[i];
                        if (newModelPosition && !state.modelState.selection.containsPosition(newModelPosition)) {
                            continue;
                        }
                        if (newViewPosition && !state.viewState.selection.containsPosition(newViewPosition)) {
                            continue;
                        }
                        // => Remove the cursor
                        states.splice(i, 1);
                        viewModel.model.pushStackElement();
                        viewModel.setCursorStates(args.source, 3 /* Explicit */, states);
                        return;
                    }
                }
                // => Add the new cursor
                states.push(newState);
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, states);
            }
        });
        CoreNavigationCommands.LastCursorMoveToSelect = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: '_lastCursorMoveToSelect',
                    precondition: undefined
                });
            }
            runCoreEditorCommand(viewModel, args) {
                const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
                const states = viewModel.getCursorStates();
                const newStates = states.slice(0);
                newStates[lastAddedCursorIndex] = cursorMoveCommands_1.CursorMoveCommands.moveTo(viewModel, states[lastAddedCursorIndex], true, args.position, args.viewPosition);
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, newStates);
            }
        });
        class HomeCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, cursorMoveCommands_1.CursorMoveCommands.moveToBeginningOfLine(viewModel, viewModel.getCursorStates(), this._inSelectionMode));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.CursorHome = editorExtensions_1.registerEditorCommand(new HomeCommand({
            inSelectionMode: false,
            id: 'cursorHome',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 14 /* Home */,
                mac: { primary: 14 /* Home */, secondary: [2048 /* CtrlCmd */ | 15 /* LeftArrow */] }
            }
        }));
        CoreNavigationCommands.CursorHomeSelect = editorExtensions_1.registerEditorCommand(new HomeCommand({
            inSelectionMode: true,
            id: 'cursorHomeSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* Shift */ | 14 /* Home */,
                mac: { primary: 1024 /* Shift */ | 14 /* Home */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 15 /* LeftArrow */] }
            }
        }));
        class LineStartCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, this._exec(viewModel.getCursorStates()));
                viewModel.revealPrimaryCursor(args.source, true);
            }
            _exec(cursors) {
                const result = [];
                for (let i = 0, len = cursors.length; i < len; i++) {
                    const cursor = cursors[i];
                    const lineNumber = cursor.modelState.position.lineNumber;
                    result[i] = cursorCommon_1.CursorState.fromModelState(cursor.modelState.move(this._inSelectionMode, lineNumber, 1, 0));
                }
                return result;
            }
        }
        CoreNavigationCommands.CursorLineStart = editorExtensions_1.registerEditorCommand(new LineStartCommand({
            inSelectionMode: false,
            id: 'cursorLineStart',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 /* WinCtrl */ | 31 /* KEY_A */ }
            }
        }));
        CoreNavigationCommands.CursorLineStartSelect = editorExtensions_1.registerEditorCommand(new LineStartCommand({
            inSelectionMode: true,
            id: 'cursorLineStartSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 31 /* KEY_A */ }
            }
        }));
        class EndCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, cursorMoveCommands_1.CursorMoveCommands.moveToEndOfLine(viewModel, viewModel.getCursorStates(), this._inSelectionMode, args.sticky || false));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.CursorEnd = editorExtensions_1.registerEditorCommand(new EndCommand({
            inSelectionMode: false,
            id: 'cursorEnd',
            precondition: undefined,
            kbOpts: {
                args: { sticky: false },
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 13 /* End */,
                mac: { primary: 13 /* End */, secondary: [2048 /* CtrlCmd */ | 17 /* RightArrow */] }
            },
            description: {
                description: `Go to End`,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            properties: {
                                'sticky': {
                                    description: nls.localize('stickydesc', "Stick to the end even when going to longer lines"),
                                    type: 'boolean',
                                    default: false
                                }
                            }
                        }
                    }]
            }
        }));
        CoreNavigationCommands.CursorEndSelect = editorExtensions_1.registerEditorCommand(new EndCommand({
            inSelectionMode: true,
            id: 'cursorEndSelect',
            precondition: undefined,
            kbOpts: {
                args: { sticky: false },
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 1024 /* Shift */ | 13 /* End */,
                mac: { primary: 1024 /* Shift */ | 13 /* End */, secondary: [2048 /* CtrlCmd */ | 1024 /* Shift */ | 17 /* RightArrow */] }
            },
            description: {
                description: `Select to End`,
                args: [{
                        name: 'args',
                        schema: {
                            type: 'object',
                            properties: {
                                'sticky': {
                                    description: nls.localize('stickydesc', "Stick to the end even when going to longer lines"),
                                    type: 'boolean',
                                    default: false
                                }
                            }
                        }
                    }]
            }
        }));
        class LineEndCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, this._exec(viewModel, viewModel.getCursorStates()));
                viewModel.revealPrimaryCursor(args.source, true);
            }
            _exec(viewModel, cursors) {
                const result = [];
                for (let i = 0, len = cursors.length; i < len; i++) {
                    const cursor = cursors[i];
                    const lineNumber = cursor.modelState.position.lineNumber;
                    const maxColumn = viewModel.model.getLineMaxColumn(lineNumber);
                    result[i] = cursorCommon_1.CursorState.fromModelState(cursor.modelState.move(this._inSelectionMode, lineNumber, maxColumn, 0));
                }
                return result;
            }
        }
        CoreNavigationCommands.CursorLineEnd = editorExtensions_1.registerEditorCommand(new LineEndCommand({
            inSelectionMode: false,
            id: 'cursorLineEnd',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 /* WinCtrl */ | 35 /* KEY_E */ }
            }
        }));
        CoreNavigationCommands.CursorLineEndSelect = editorExtensions_1.registerEditorCommand(new LineEndCommand({
            inSelectionMode: true,
            id: 'cursorLineEndSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 0,
                mac: { primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 35 /* KEY_E */ }
            }
        }));
        class TopCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, cursorMoveCommands_1.CursorMoveCommands.moveToBeginningOfBuffer(viewModel, viewModel.getCursorStates(), this._inSelectionMode));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.CursorTop = editorExtensions_1.registerEditorCommand(new TopCommand({
            inSelectionMode: false,
            id: 'cursorTop',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* CtrlCmd */ | 14 /* Home */,
                mac: { primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */ }
            }
        }));
        CoreNavigationCommands.CursorTopSelect = editorExtensions_1.registerEditorCommand(new TopCommand({
            inSelectionMode: true,
            id: 'cursorTopSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 14 /* Home */,
                mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 16 /* UpArrow */ }
            }
        }));
        class BottomCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, cursorMoveCommands_1.CursorMoveCommands.moveToEndOfBuffer(viewModel, viewModel.getCursorStates(), this._inSelectionMode));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.CursorBottom = editorExtensions_1.registerEditorCommand(new BottomCommand({
            inSelectionMode: false,
            id: 'cursorBottom',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* CtrlCmd */ | 13 /* End */,
                mac: { primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */ }
            }
        }));
        CoreNavigationCommands.CursorBottomSelect = editorExtensions_1.registerEditorCommand(new BottomCommand({
            inSelectionMode: true,
            id: 'cursorBottomSelect',
            precondition: undefined,
            kbOpts: {
                weight: CORE_WEIGHT,
                kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 13 /* End */,
                mac: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 18 /* DownArrow */ }
            }
        }));
        class EditorScrollImpl extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'editorScroll',
                    precondition: undefined,
                    description: EditorScroll_.description
                });
            }
            runCoreEditorCommand(viewModel, args) {
                const parsed = EditorScroll_.parse(args);
                if (!parsed) {
                    // illegal arguments
                    return;
                }
                this._runEditorScroll(viewModel, args.source, parsed);
            }
            _runEditorScroll(viewModel, source, args) {
                const desiredScrollTop = this._computeDesiredScrollTop(viewModel, args);
                if (args.revealCursor) {
                    // must ensure cursor is in new visible range
                    const desiredVisibleViewRange = viewModel.getCompletelyVisibleViewRangeAtScrollTop(desiredScrollTop);
                    viewModel.setCursorStates(source, 3 /* Explicit */, [
                        cursorMoveCommands_1.CursorMoveCommands.findPositionInViewportIfOutside(viewModel, viewModel.getPrimaryCursorState(), desiredVisibleViewRange, args.select)
                    ]);
                }
                viewModel.setScrollTop(desiredScrollTop, 0 /* Smooth */);
            }
            _computeDesiredScrollTop(viewModel, args) {
                if (args.unit === 1 /* Line */) {
                    // scrolling by model lines
                    const visibleViewRange = viewModel.getCompletelyVisibleViewRange();
                    const visibleModelRange = viewModel.coordinatesConverter.convertViewRangeToModelRange(visibleViewRange);
                    let desiredTopModelLineNumber;
                    if (args.direction === 1 /* Up */) {
                        // must go x model lines up
                        desiredTopModelLineNumber = Math.max(1, visibleModelRange.startLineNumber - args.value);
                    }
                    else {
                        // must go x model lines down
                        desiredTopModelLineNumber = Math.min(viewModel.model.getLineCount(), visibleModelRange.startLineNumber + args.value);
                    }
                    const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(new position_1.Position(desiredTopModelLineNumber, 1));
                    return viewModel.getVerticalOffsetForLineNumber(viewPosition.lineNumber);
                }
                let noOfLines;
                if (args.unit === 3 /* Page */) {
                    noOfLines = viewModel.cursorConfig.pageSize * args.value;
                }
                else if (args.unit === 4 /* HalfPage */) {
                    noOfLines = Math.round(viewModel.cursorConfig.pageSize / 2) * args.value;
                }
                else {
                    noOfLines = args.value;
                }
                const deltaLines = (args.direction === 1 /* Up */ ? -1 : 1) * noOfLines;
                return viewModel.getScrollTop() + deltaLines * viewModel.cursorConfig.lineHeight;
            }
        }
        CoreNavigationCommands.EditorScrollImpl = EditorScrollImpl;
        CoreNavigationCommands.EditorScroll = editorExtensions_1.registerEditorCommand(new EditorScrollImpl());
        CoreNavigationCommands.ScrollLineUp = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollLineUp',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* CtrlCmd */ | 16 /* UpArrow */,
                        mac: { primary: 256 /* WinCtrl */ | 11 /* PageUp */ }
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll._runEditorScroll(viewModel, args.source, {
                    direction: 1 /* Up */,
                    unit: 2 /* WrappedLine */,
                    value: 1,
                    revealCursor: false,
                    select: false
                });
            }
        });
        CoreNavigationCommands.ScrollPageUp = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollPageUp',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* CtrlCmd */ | 11 /* PageUp */,
                        win: { primary: 512 /* Alt */ | 11 /* PageUp */ },
                        linux: { primary: 512 /* Alt */ | 11 /* PageUp */ }
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll._runEditorScroll(viewModel, args.source, {
                    direction: 1 /* Up */,
                    unit: 3 /* Page */,
                    value: 1,
                    revealCursor: false,
                    select: false
                });
            }
        });
        CoreNavigationCommands.ScrollLineDown = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollLineDown',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* CtrlCmd */ | 18 /* DownArrow */,
                        mac: { primary: 256 /* WinCtrl */ | 12 /* PageDown */ }
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll._runEditorScroll(viewModel, args.source, {
                    direction: 2 /* Down */,
                    unit: 2 /* WrappedLine */,
                    value: 1,
                    revealCursor: false,
                    select: false
                });
            }
        });
        CoreNavigationCommands.ScrollPageDown = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'scrollPageDown',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* CtrlCmd */ | 12 /* PageDown */,
                        win: { primary: 512 /* Alt */ | 12 /* PageDown */ },
                        linux: { primary: 512 /* Alt */ | 12 /* PageDown */ }
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                CoreNavigationCommands.EditorScroll._runEditorScroll(viewModel, args.source, {
                    direction: 2 /* Down */,
                    unit: 3 /* Page */,
                    value: 1,
                    revealCursor: false,
                    select: false
                });
            }
        });
        class WordCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.word(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args.position)
                ]);
                viewModel.revealPrimaryCursor(args.source, true);
            }
        }
        CoreNavigationCommands.WordSelect = editorExtensions_1.registerEditorCommand(new WordCommand({
            inSelectionMode: false,
            id: '_wordSelect',
            precondition: undefined
        }));
        CoreNavigationCommands.WordSelectDrag = editorExtensions_1.registerEditorCommand(new WordCommand({
            inSelectionMode: true,
            id: '_wordSelectDrag',
            precondition: undefined
        }));
        CoreNavigationCommands.LastCursorWordSelect = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'lastCursorWordSelect',
                    precondition: undefined
                });
            }
            runCoreEditorCommand(viewModel, args) {
                const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
                const states = viewModel.getCursorStates();
                const newStates = states.slice(0);
                const lastAddedState = states[lastAddedCursorIndex];
                newStates[lastAddedCursorIndex] = cursorMoveCommands_1.CursorMoveCommands.word(viewModel, lastAddedState, lastAddedState.modelState.hasSelection(), args.position);
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, newStates);
            }
        });
        class LineCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.line(viewModel, viewModel.getPrimaryCursorState(), this._inSelectionMode, args.position, args.viewPosition)
                ]);
                viewModel.revealPrimaryCursor(args.source, false);
            }
        }
        CoreNavigationCommands.LineSelect = editorExtensions_1.registerEditorCommand(new LineCommand({
            inSelectionMode: false,
            id: '_lineSelect',
            precondition: undefined
        }));
        CoreNavigationCommands.LineSelectDrag = editorExtensions_1.registerEditorCommand(new LineCommand({
            inSelectionMode: true,
            id: '_lineSelectDrag',
            precondition: undefined
        }));
        class LastCursorLineCommand extends CoreEditorCommand {
            constructor(opts) {
                super(opts);
                this._inSelectionMode = opts.inSelectionMode;
            }
            runCoreEditorCommand(viewModel, args) {
                const lastAddedCursorIndex = viewModel.getLastAddedCursorIndex();
                const states = viewModel.getCursorStates();
                const newStates = states.slice(0);
                newStates[lastAddedCursorIndex] = cursorMoveCommands_1.CursorMoveCommands.line(viewModel, states[lastAddedCursorIndex], this._inSelectionMode, args.position, args.viewPosition);
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, newStates);
            }
        }
        CoreNavigationCommands.LastCursorLineSelect = editorExtensions_1.registerEditorCommand(new LastCursorLineCommand({
            inSelectionMode: false,
            id: 'lastCursorLineSelect',
            precondition: undefined
        }));
        CoreNavigationCommands.LastCursorLineSelectDrag = editorExtensions_1.registerEditorCommand(new LastCursorLineCommand({
            inSelectionMode: true,
            id: 'lastCursorLineSelectDrag',
            precondition: undefined
        }));
        CoreNavigationCommands.ExpandLineSelection = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'expandLineSelection',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 2048 /* CtrlCmd */ | 42 /* KEY_L */
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, cursorMoveCommands_1.CursorMoveCommands.expandLineSelection(viewModel, viewModel.getCursorStates()));
                viewModel.revealPrimaryCursor(args.source, true);
            }
        });
        CoreNavigationCommands.CancelSelection = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'cancelSelection',
                    precondition: editorContextKeys_1.EditorContextKeys.hasNonEmptySelection,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 9 /* Escape */,
                        secondary: [1024 /* Shift */ | 9 /* Escape */]
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.cancelSelection(viewModel, viewModel.getPrimaryCursorState())
                ]);
                viewModel.revealPrimaryCursor(args.source, true);
            }
        });
        CoreNavigationCommands.RemoveSecondaryCursors = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'removeSecondaryCursors',
                    precondition: editorContextKeys_1.EditorContextKeys.hasMultipleSelections,
                    kbOpts: {
                        weight: CORE_WEIGHT + 1,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 9 /* Escape */,
                        secondary: [1024 /* Shift */ | 9 /* Escape */]
                    }
                });
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, [
                    viewModel.getPrimaryCursorState()
                ]);
                viewModel.revealPrimaryCursor(args.source, true);
            }
        });
        CoreNavigationCommands.RevealLine = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'revealLine',
                    precondition: undefined,
                    description: RevealLine_.description
                });
            }
            runCoreEditorCommand(viewModel, args) {
                const revealLineArg = args;
                let lineNumber = (revealLineArg.lineNumber || 0) + 1;
                if (lineNumber < 1) {
                    lineNumber = 1;
                }
                const lineCount = viewModel.model.getLineCount();
                if (lineNumber > lineCount) {
                    lineNumber = lineCount;
                }
                const range = new range_1.Range(lineNumber, 1, lineNumber, viewModel.model.getLineMaxColumn(lineNumber));
                let revealAt = 0 /* Simple */;
                if (revealLineArg.at) {
                    switch (revealLineArg.at) {
                        case RevealLine_.RawAtArgument.Top:
                            revealAt = 3 /* Top */;
                            break;
                        case RevealLine_.RawAtArgument.Center:
                            revealAt = 1 /* Center */;
                            break;
                        case RevealLine_.RawAtArgument.Bottom:
                            revealAt = 4 /* Bottom */;
                            break;
                        default:
                            break;
                    }
                }
                const viewRange = viewModel.coordinatesConverter.convertModelRangeToViewRange(range);
                viewModel.revealRange(args.source, false, viewRange, revealAt, 0 /* Smooth */);
            }
        });
        CoreNavigationCommands.SelectAll = new class extends EditorOrNativeTextInputCommand {
            constructor() {
                super(editorExtensions_1.SelectAllCommand);
            }
            runDOMCommand() {
                document.execCommand('selectAll');
            }
            runEditorCommand(accessor, editor, args) {
                const viewModel = editor._getViewModel();
                if (!viewModel) {
                    // the editor has no view => has no cursors
                    return;
                }
                this.runCoreEditorCommand(viewModel, args);
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates('keyboard', 3 /* Explicit */, [
                    cursorMoveCommands_1.CursorMoveCommands.selectAll(viewModel, viewModel.getPrimaryCursorState())
                ]);
            }
        }();
        CoreNavigationCommands.SetSelection = editorExtensions_1.registerEditorCommand(new class extends CoreEditorCommand {
            constructor() {
                super({
                    id: 'setSelection',
                    precondition: undefined
                });
            }
            runCoreEditorCommand(viewModel, args) {
                viewModel.model.pushStackElement();
                viewModel.setCursorStates(args.source, 3 /* Explicit */, [
                    cursorCommon_1.CursorState.fromModelSelection(args.selection)
                ]);
            }
        });
    })(CoreNavigationCommands = exports.CoreNavigationCommands || (exports.CoreNavigationCommands = {}));
    const columnSelectionCondition = contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.textInputFocus, editorContextKeys_1.EditorContextKeys.columnSelection);
    function registerColumnSelection(id, keybinding) {
        keybindingsRegistry_1.KeybindingsRegistry.registerKeybindingRule({
            id: id,
            primary: keybinding,
            when: columnSelectionCondition,
            weight: CORE_WEIGHT + 1
        });
    }
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectLeft.id, 1024 /* Shift */ | 15 /* LeftArrow */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectRight.id, 1024 /* Shift */ | 17 /* RightArrow */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectUp.id, 1024 /* Shift */ | 16 /* UpArrow */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectPageUp.id, 1024 /* Shift */ | 11 /* PageUp */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectDown.id, 1024 /* Shift */ | 18 /* DownArrow */);
    registerColumnSelection(CoreNavigationCommands.CursorColumnSelectPageDown.id, 1024 /* Shift */ | 12 /* PageDown */);
    function registerCommand(command) {
        command.register();
        return command;
    }
    var CoreEditingCommands;
    (function (CoreEditingCommands) {
        class CoreEditingCommand extends editorExtensions_1.EditorCommand {
            runEditorCommand(accessor, editor, args) {
                const viewModel = editor._getViewModel();
                if (!viewModel) {
                    // the editor has no view => has no cursors
                    return;
                }
                this.runCoreEditingCommand(editor, viewModel, args || {});
            }
        }
        CoreEditingCommands.CoreEditingCommand = CoreEditingCommand;
        CoreEditingCommands.LineBreakInsert = editorExtensions_1.registerEditorCommand(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'lineBreakInsert',
                    precondition: editorContextKeys_1.EditorContextKeys.writable,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 0,
                        mac: { primary: 256 /* WinCtrl */ | 45 /* KEY_O */ }
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                editor.pushUndoStop();
                editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.lineBreakInsert(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection)));
            }
        });
        CoreEditingCommands.Outdent = editorExtensions_1.registerEditorCommand(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'outdent',
                    precondition: editorContextKeys_1.EditorContextKeys.writable,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus),
                        primary: 1024 /* Shift */ | 2 /* Tab */
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                editor.pushUndoStop();
                editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.outdent(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection)));
                editor.pushUndoStop();
            }
        });
        CoreEditingCommands.Tab = editorExtensions_1.registerEditorCommand(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'tab',
                    precondition: editorContextKeys_1.EditorContextKeys.writable,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: contextkey_1.ContextKeyExpr.and(editorContextKeys_1.EditorContextKeys.editorTextFocus, editorContextKeys_1.EditorContextKeys.tabDoesNotMoveFocus),
                        primary: 2 /* Tab */
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                editor.pushUndoStop();
                editor.executeCommands(this.id, cursorTypeOperations_1.TypeOperations.tab(viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection)));
                editor.pushUndoStop();
            }
        });
        CoreEditingCommands.DeleteLeft = editorExtensions_1.registerEditorCommand(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'deleteLeft',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 1 /* Backspace */,
                        secondary: [1024 /* Shift */ | 1 /* Backspace */],
                        mac: { primary: 1 /* Backspace */, secondary: [1024 /* Shift */ | 1 /* Backspace */, 256 /* WinCtrl */ | 38 /* KEY_H */, 256 /* WinCtrl */ | 1 /* Backspace */] }
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                const [shouldPushStackElementBefore, commands] = cursorDeleteOperations_1.DeleteOperations.deleteLeft(viewModel.getPrevEditOperationType(), viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection));
                if (shouldPushStackElementBefore) {
                    editor.pushUndoStop();
                }
                editor.executeCommands(this.id, commands);
                viewModel.setPrevEditOperationType(2 /* DeletingLeft */);
            }
        });
        CoreEditingCommands.DeleteRight = editorExtensions_1.registerEditorCommand(new class extends CoreEditingCommand {
            constructor() {
                super({
                    id: 'deleteRight',
                    precondition: undefined,
                    kbOpts: {
                        weight: CORE_WEIGHT,
                        kbExpr: editorContextKeys_1.EditorContextKeys.textInputFocus,
                        primary: 20 /* Delete */,
                        mac: { primary: 20 /* Delete */, secondary: [256 /* WinCtrl */ | 34 /* KEY_D */, 256 /* WinCtrl */ | 20 /* Delete */] }
                    }
                });
            }
            runCoreEditingCommand(editor, viewModel, args) {
                const [shouldPushStackElementBefore, commands] = cursorDeleteOperations_1.DeleteOperations.deleteRight(viewModel.getPrevEditOperationType(), viewModel.cursorConfig, viewModel.model, viewModel.getCursorStates().map(s => s.modelState.selection));
                if (shouldPushStackElementBefore) {
                    editor.pushUndoStop();
                }
                editor.executeCommands(this.id, commands);
                viewModel.setPrevEditOperationType(3 /* DeletingRight */);
            }
        });
        CoreEditingCommands.Undo = new class extends EditorOrNativeTextInputCommand {
            constructor() {
                super(editorExtensions_1.UndoCommand);
            }
            runDOMCommand() {
                document.execCommand('undo');
            }
            runEditorCommand(accessor, editor, args) {
                if (!editor.hasModel() || editor.getOption(72 /* readOnly */) === true) {
                    return;
                }
                editor.getModel().undo();
            }
        }();
        CoreEditingCommands.Redo = new class extends EditorOrNativeTextInputCommand {
            constructor() {
                super(editorExtensions_1.RedoCommand);
            }
            runDOMCommand() {
                document.execCommand('redo');
            }
            runEditorCommand(accessor, editor, args) {
                if (!editor.hasModel() || editor.getOption(72 /* readOnly */) === true) {
                    return;
                }
                editor.getModel().redo();
            }
        }();
    })(CoreEditingCommands = exports.CoreEditingCommands || (exports.CoreEditingCommands = {}));
    /**
     * A command that will invoke a command on the focused editor.
     */
    class EditorHandlerCommand extends editorExtensions_1.Command {
        constructor(id, handlerId, description) {
            super({
                id: id,
                precondition: undefined,
                description: description
            });
            this._handlerId = handlerId;
        }
        runCommand(accessor, args) {
            const editor = accessor.get(codeEditorService_1.ICodeEditorService).getFocusedCodeEditor();
            if (!editor) {
                return;
            }
            editor.trigger('keyboard', this._handlerId, args);
        }
    }
    function registerOverwritableCommand(handlerId, description) {
        registerCommand(new EditorHandlerCommand('default:' + handlerId, handlerId));
        registerCommand(new EditorHandlerCommand(handlerId, handlerId, description));
    }
    registerOverwritableCommand("type" /* Type */, {
        description: `Type`,
        args: [{
                name: 'args',
                schema: {
                    'type': 'object',
                    'required': ['text'],
                    'properties': {
                        'text': {
                            'type': 'string'
                        }
                    },
                }
            }]
    });
    registerOverwritableCommand("replacePreviousChar" /* ReplacePreviousChar */);
    registerOverwritableCommand("compositionStart" /* CompositionStart */);
    registerOverwritableCommand("compositionEnd" /* CompositionEnd */);
    registerOverwritableCommand("paste" /* Paste */);
    registerOverwritableCommand("cut" /* Cut */);
});
//# __sourceMappingURL=coreCommands.js.map