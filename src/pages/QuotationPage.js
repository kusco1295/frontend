import React from 'react';
import DocumentComposer from '../components/DocumentComposer';

const QuotationPage = () => (
  <DocumentComposer
    pageTitle="Quotation PDF"
    documentTitle="QUOTATION"
    numberLabel="Quotation No"
    numberField="quotationNo"
    numberPlaceholder="e.g. QT-001"
    filePrefix="Quotation"
    accentColor="#667eea"
    titleBarColor="#111827"
    pdfButtonColor="linear-gradient(135deg, #667eea, #764ba2)"
    footerNote="This quotation is generated electronically and is valid without a signature."
    totalLabel="Total"
    taxLabel="GST"
    showFreightAmountField
  />
);

export default QuotationPage;
