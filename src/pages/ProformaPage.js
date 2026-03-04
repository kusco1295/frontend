import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdArrowBack, MdAdd, MdDelete, MdPictureAsPdf } from 'react-icons/md';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ROUTES } from '../constants/endpoints';
import '../styles/Quotation.css';

const emptyRow = () => ({ itemCode: '', description: '', quantity: '', rate: '', unit: '' });

const ProformaPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const pdfRef    = useRef();
  const inq       = location.state?.inq;

  const [header, setHeader] = useState({
    companyName:    inq?.company  || '',
    companyAddress: inq?.address  || '',
    companyEmail:   inq?.email    || '',
    kindAttention:  inq?.name     || '',
    msmeNo: '', provisionalGstNo: '',
    hsnCode: '', panNo: '',
    invoiceNo: '', invoiceDate: new Date().toISOString().slice(0, 10), inquiryNo: inq?.inquiryNo || '',
    inquiryDate: inq?.createdAt ? new Date(inq.createdAt).toISOString().slice(0, 10) : '', inquiryDueDate: '',
  });

  const [rows, setRows] = useState([emptyRow()]);

  const [terms, setTerms] = useState({
    price: '', exWork: '', tax: '', deliverySchedule: '',
    payment: '', packingForwarding: '', freight: '', validity: '',
  });

  const [generating, setGenerating] = useState(false);

  const handleHeader = (e) =>
    setHeader((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleTerms = (e) =>
    setTerms((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleRow = (i, e) =>
    setRows((p) => p.map((r, idx) => idx === i ? { ...r, [e.target.name]: e.target.value } : r));

  const addRow = () => setRows((p) => [...p, emptyRow()]);
  const removeRow = (i) => setRows((p) => p.filter((_, idx) => idx !== i));

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const el = pdfRef.current;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;
      let y = 0;
      while (y < imgH) {
        pdf.addImage(imgData, 'PNG', 0, -y, pageW, imgH);
        y += pageH;
        if (y < imgH) pdf.addPage();
      }
      pdf.save(`ProformaInvoice-${header.invoiceNo || 'draft'}.pdf`);
    } catch { /* silent */ }
    finally { setGenerating(false); }
  };

  return (
    <div className="quot-page">
      <div className="quot-topbar">
        <button className="btn-back" onClick={() => navigate(`${ROUTES.ADMIN_DEPARTMENT}/Sales%20Coordinator`)}>
          <MdArrowBack /> Back
        </button>
        <h2 className="quot-title">Performa Invoice</h2>
      </div>

      <div className="quot-preview" ref={pdfRef}>

        <div className="quot-doc-title" style={{ borderColor: '#f59e0b' }}>PERFORMA INVOICE</div>

        <div className="quot-header-grid">
          <div className="quot-col">
            <div className="quot-field"><label>Company Name</label><input name="companyName" value={header.companyName} onChange={handleHeader} placeholder="Enter company name" /></div>
            <div className="quot-field"><label>Company Address</label><input name="companyAddress" value={header.companyAddress} onChange={handleHeader} placeholder="Enter address" /></div>
            <div className="quot-field"><label>Company Email</label><input name="companyEmail" value={header.companyEmail} onChange={handleHeader} placeholder="Enter email" /></div>
            <div className="quot-field"><label>Kind Attention</label><input name="kindAttention" value={header.kindAttention} onChange={handleHeader} placeholder="Enter contact person" /></div>
            <div className="quot-field"><label>MSME No</label><input name="msmeNo" value={header.msmeNo} onChange={handleHeader} placeholder="Enter MSME number" /></div>
            <div className="quot-field"><label>Provisional GST No</label><input name="provisionalGstNo" value={header.provisionalGstNo} onChange={handleHeader} placeholder="Enter GST number" /></div>
            <div className="quot-field"><label>HSN Code</label><input name="hsnCode" value={header.hsnCode} onChange={handleHeader} placeholder="Enter HSN code" /></div>
            <div className="quot-field"><label>PAN No</label><input name="panNo" value={header.panNo} onChange={handleHeader} placeholder="Enter PAN number" /></div>
          </div>
          <div className="quot-col">
            <div className="quot-field"><label>Invoice No</label><input name="invoiceNo" value={header.invoiceNo} onChange={handleHeader} placeholder="e.g. PI-001" /></div>
            <div className="quot-field"><label>Invoice Date</label><input name="invoiceDate" type="date" value={header.invoiceDate} onChange={handleHeader} /></div>
            <div className="quot-field"><label>Inquiry No</label><input name="inquiryNo" value={header.inquiryNo} onChange={handleHeader} placeholder="e.g. INQ-001" /></div>
            <div className="quot-field"><label>Inquiry Date</label><input name="inquiryDate" type="date" value={header.inquiryDate} onChange={handleHeader} /></div>
            <div className="quot-field"><label>Inquiry Due Date</label><input name="inquiryDueDate" type="date" value={header.inquiryDueDate} onChange={handleHeader} /></div>
          </div>
        </div>

        <div className="quot-section-title">Items</div>
        <table className="quot-table">
          <thead>
            <tr>
              <th>Sr No</th><th>Item Code</th><th>Description</th>
              <th>Quantity</th><th>Rate (INR)</th><th>Unit</th>
              <th className="quot-col-action">—</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="quot-sr">{i + 1}</td>
                <td><input name="itemCode"    value={row.itemCode}    onChange={(e) => handleRow(i, e)} placeholder="Code" /></td>
                <td><input name="description" value={row.description} onChange={(e) => handleRow(i, e)} placeholder="Description" /></td>
                <td><input name="quantity"    value={row.quantity}    onChange={(e) => handleRow(i, e)} placeholder="Qty" /></td>
                <td><input name="rate"        value={row.rate}        onChange={(e) => handleRow(i, e)} placeholder="0.00" /></td>
                <td><input name="unit"        value={row.unit}        onChange={(e) => handleRow(i, e)} placeholder="pcs" /></td>
                <td className="quot-col-action">
                  {rows.length > 1 && (
                    <button className="quot-row-del" onClick={() => removeRow(i)}><MdDelete /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="quot-add-row" onClick={addRow}><MdAdd /> Add Row</button>

        <div className="quot-section-title">Terms &amp; Conditions</div>
        <div className="quot-terms-grid">
          {[
            { name: 'price',             label: 'Price' },
            { name: 'exWork',            label: 'Ex-Work' },
            { name: 'tax',               label: 'Tax' },
            { name: 'deliverySchedule',  label: 'Delivery Schedule' },
            { name: 'payment',           label: 'Payment' },
            { name: 'packingForwarding', label: 'Packing & Forwarding' },
            { name: 'freight',           label: 'Freight' },
            { name: 'validity',          label: 'Validity' },
          ].map(({ name, label }) => (
            <div className="quot-field" key={name}>
              <label>{label}</label>
              <input name={name} value={terms[name]} onChange={handleTerms} placeholder={`Enter ${label.toLowerCase()}`} />
            </div>
          ))}
        </div>

      </div>

      <div className="quot-bottom-bar">
        <button className="quot-pdf-btn" onClick={generatePDF} disabled={generating} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
          <MdPictureAsPdf /> {generating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
    </div>
  );
};

export default ProformaPage;
