import React from 'react';
import DocumentComposer from '../components/DocumentComposer';

const TaxInvoicePage = () => (
  <DocumentComposer
    pageTitle="Tax Invoice PDF"
    documentTitle="TAX INVOICE"
    numberLabel="Invoice No"
    numberField="invoiceNo"
    numberPlaceholder="e.g. TI-001"
    filePrefix="TaxInvoice"
    accentColor="#10b981"
    titleBarColor="#064e3b"
    pdfButtonColor="linear-gradient(135deg, #10b981, #059669)"
    footerNote="This tax invoice is generated electronically and is valid without a signature."
    taxLabel="GST"
    includeFreightInTotal
    showTaxAmountLine={false}
    includePackingForwardingInTotal
    moveTaxBelowPacking
  />
);

export default TaxInvoicePage;
