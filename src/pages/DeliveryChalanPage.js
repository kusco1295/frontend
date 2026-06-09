import React from 'react';
import DocumentComposer from '../components/DocumentComposer';

const DeliveryChalanPage = () => (
  <DocumentComposer
    pageTitle="Delivery Chalan PDF"
    documentTitle="DELIVERY CHALAN"
    numberLabel="Chalan No"
    numberField="chalanNo"
    numberPlaceholder="e.g. DC-001"
    filePrefix="DeliveryChalan"
    accentColor="#3b82f6"
    titleBarColor="#1e3a8a"
    pdfButtonColor="linear-gradient(135deg, #3b82f6, #2563eb)"
    footerNote="This delivery chalan is generated electronically and is valid without a signature."
    taxLabel="GST"
    includeFreightInTotal={false}
    showTaxAmountLine={false}
    includePackingForwardingInTotal={false}
  />
);

export default DeliveryChalanPage;
