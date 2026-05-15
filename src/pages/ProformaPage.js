import React from 'react';
import DocumentComposer from '../components/DocumentComposer';

const ProformaPage = () => (
  <DocumentComposer
    pageTitle="Performa PDF"
    documentTitle="PROFORMA INVOICE"
    numberLabel="Invoice No"
    numberField="invoiceNo"
    numberPlaceholder="e.g. PI-001"
    filePrefix="ProformaInvoice"
    accentColor="#f59e0b"
    titleBarColor="#92400e"
    pdfButtonColor="linear-gradient(135deg, #f59e0b, #d97706)"
    footerNote="This proforma invoice is generated electronically and is valid without a signature."
    taxLabel="GST"
    includeFreightInTotal
    showTaxAmountLine={false}
    includePackingForwardingInTotal
    moveTaxBelowPacking
  />
);

export default ProformaPage;
