/** @odoo-module */

import { _t } from "@web/core/l10n/translation";
import { patch } from "@web/core/utils/patch";
import { Domain } from "@web/core/domain";
import { SpreadsheetSelectorDialog } from "@spreadsheet_edition/assets/components/spreadsheet_selector_dialog/spreadsheet_selector_dialog";
import { SpreadsheetSelectorPanel } from "@spreadsheet_edition/assets/components/spreadsheet_selector_dialog/spreadsheet_selector_panel";

export class DocumentsSelectorPanel extends SpreadsheetSelectorPanel {
    constructor() {
        super(...arguments);
        this.actionTag = "action_open_spreadsheet";
        this.notificationMessage = _t("New spreadsheet created in Documents");
    }

    /**
     * Fetch spreadsheets according to the search domain and the pager
     * offset given as parameter.
     * @override
     * @returns {Promise<void>}
     */
    async _fetchSpreadsheets() {
        const { offset, limit } = this.state.pagerProps;
        this.state.spreadsheets = await this.keepLast.add(
            this.orm.call("documents.document", "get_spreadsheets_to_display", [this.domain], {
                offset,
                limit,
            })
        );
    }

    /**
     * @override
     * @returns {Promise<number>}
     */
    async _fetchPagerTotal() {
        return this.orm.searchCount(
            "documents.document",
            Domain.and([this.domain, [["handler", "=", "spreadsheet"]]]).toList()
        );
    }
}
patch(SpreadsheetSelectorDialog, "documents_spreadsheet.SpreadsheetSelectorDialog", {
    components: { ...SpreadsheetSelectorDialog.components, DocumentsSelectorPanel },
});
