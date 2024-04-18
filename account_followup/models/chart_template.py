# -*- coding: utf-8 -*-

from odoo import models, _


class AccountChartTemplate(models.Model):
    _inherit = "account.chart.template"

    def _load(self, company):
        res = super(AccountChartTemplate, self)._load(company)

        if not self.env['account_followup.followup.line'].search([('company_id', '=', company.id)]):
            self.env['account_followup.followup.line'].create({
                'company_id': company.id,
                'name': _('First Reminder'),
                'delay': 15,
            })

        return res
