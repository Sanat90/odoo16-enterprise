# Part of Odoo. See LICENSE file for full copyright and licensing details.

{
    'name': "Payment Provider: Sepa Direct Debit",
    'version': '2.0',
    'category': 'Accounting/Accounting',
    'sequence': 350,
    'summary': "A payment provider for enabling Sepa Direct Debit in the EU.",
    'description': " ",  # Non-empty string to avoid loading the README file.
    'depends': ['account_sepa_direct_debit', 'account_payment', 'sms'],
    'data': [
        'views/payment_provider_views.xml',
        'views/payment_sepa_direct_debit_templates.xml',
        'views/sdd_mandate_views.xml',

        'data/mail_template_data.xml',
        'data/payment_provider_data.xml',
    ],
    'application': False,
    'uninstall_hook': 'uninstall_hook',
    'assets': {
        'web.assets_common': [
            'payment_sepa_direct_debit/static/src/xml/signature_form.xml',
        ],
        'web.assets_frontend': [
            'payment_sepa_direct_debit/static/src/js/payment_form.js',
            'payment_sepa_direct_debit/static/src/js/signature_form.js',
            'payment_sepa_direct_debit/static/src/xml/signature_form.xml'
        ],
    },
    'license': 'OEEL-1',
}
