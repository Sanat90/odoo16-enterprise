# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo.tests import tagged

from .test_ui_common import TestUiCommon


@tagged('-at_install', 'post_install')
class TestUi(TestUiCommon):
    def test_01_ui(self):
        self.start_tour("/", 'planning_test_tour', login='admin')
