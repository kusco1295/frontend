import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdAdd, MdDelete, MdPictureAsPdf, MdShare, MdClose } from 'react-icons/md';
import jsPDF from 'jspdf';
import { ROUTES } from '../constants/endpoints';
import { customerAPI } from '../services/adminAPI';
import logo from '../assets/logo.jpeg';
import '../styles/Quotation.css';

const emptyRow = () => ({ itemCode: '', description: '', quantity: '', rate: '', unit: '' });

const defaultIssuer = {
  companyName: 'KUSCO PVT LTD',
  gstNo: '10AAMCK5128N1ZD',
  panNo: 'AAMCK5128N',
  address: 'Kusha, Narhat, Nawada',
  phone: '8252745476',
  email: 'info@kusco.in',
  website: 'www.kusco.in',
  state: 'Bihar',
  stateCode: '805122',
};

const numberFormat = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const parseNumber = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) => numberFormat.format(value || 0);

const buildInitialDraft = (inq) => ({
  issuer: { ...defaultIssuer },
  documentMeta: {
    customerName: inq?.company || inq?.name || '',
    customerAttention: inq?.name || '',
    customerAddress: inq?.address || '',
    customerEmail: inq?.email || '',
    customerPhone: inq?.phone || '',
    customerGstNo: '',
    quotationNo: '',
    invoiceNo: '',
    inquiryNo: inq?.inquiryNo || '',
    inquiryDate: inq?.createdAt ? new Date(inq.createdAt).toISOString().slice(0, 10) : '',
    inquiryDueDate: '',
    documentDate: new Date().toISOString().slice(0, 10),
  },
  rows: [emptyRow()],
    terms: {
      tax: '',
      payment: '',
      deliverySchedule: '',
      packingForwarding: '',
      packingForwardingPercent: '',
      freightAmount: '',
      validity: '',
      notes: '',
    },
});

const DEPARTMENTS = [
  'Planning Dept',
  'Design Dept',
  'Purchase Dept',
  'Sales Dept',
  'Sales Coordinator',
  'Account Dept',
  'Production Dept',
  'Service Dept',
  'Store Dept',
];

const loadDraft = (key, inq) => {
  if (!key) return buildInitialDraft(inq);

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return buildInitialDraft(inq);

    const parsed = JSON.parse(raw);
    const fallback = buildInitialDraft(inq);

    return {
      issuer: { ...fallback.issuer, ...(parsed.issuer || {}) },
      documentMeta: { ...fallback.documentMeta, ...(parsed.documentMeta || {}) },
      rows: Array.isArray(parsed.rows) && parsed.rows.length ? parsed.rows : fallback.rows,
      terms: { ...fallback.terms, ...(parsed.terms || {}) },
    };
  } catch {
    return buildInitialDraft(inq);
  }
};

const buildAutoDocumentNumber = (numberField, inq) => {
  const inquiryPart = inq?.inquiryNo || inq?._id || 'DRAFT';
  if (numberField === 'quotationNo') return `QT-${inquiryPart}`;
  if (numberField === 'invoiceNo') return `PI-${inquiryPart}`;
  return inquiryPart;
};

const loadImageAsDataURL = async (src) => {
  const response = await fetch(src);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const drawWrappedText = (pdf, text, x, y, maxWidth, lineHeight = 4.6, options = {}) => {
  const safeText = text ? String(text) : '';
  const lines = safeText ? pdf.splitTextToSize(safeText, maxWidth) : [''];
  pdf.text(lines, x, y, options);
  return lines.length * lineHeight;
};

const DocumentComposer = ({
  pageTitle,
  documentTitle,
  numberLabel,
  numberField,
  numberPlaceholder,
  filePrefix,
  accentColor,
  titleBarColor,
  pdfButtonColor,
  footerNote,
  totalLabel = 'Grand Total',
  taxLabel = 'GST',
  includeFreightInTotal = false,
  showFreightAmountField = false,
  showTaxAmountLine = true,
  includePackingForwardingInTotal = false,
  moveTaxBelowPacking = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inq = location.state?.inq;
  const draftKey = inq?._id || inq?.inquiryNo ? `kusco-document-draft:${inq?._id || inq?.inquiryNo}` : 'kusco-document-draft:default';

  const initialDraft = loadDraft(draftKey, inq);

  const [issuer, setIssuer] = useState(initialDraft.issuer);
  const [documentMeta, setDocumentMeta] = useState(initialDraft.documentMeta);
  const [rows, setRows] = useState(initialDraft.rows);
  const [terms, setTerms] = useState(initialDraft.terms);
  const [generating, setGenerating] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareDept, setShareDept] = useState('');
  const [shareComment, setShareComment] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const documentNumber = documentMeta[numberField];

  useEffect(() => {
    if (!numberField) return;
    if (documentNumber) return;
    setDocumentMeta((prev) => ({
      ...prev,
      [numberField]: buildAutoDocumentNumber(numberField, inq),
    }));
  }, [documentNumber, inq, numberField]);

  const handleIssuerChange = (e) => {
    setIssuer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMetaChange = (e) => {
    setDocumentMeta((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTermsChange = (e) => {
    setTerms((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRowChange = (index, e) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [e.target.name]: e.target.value } : row
      )
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (index) => setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ issuer, documentMeta, rows, terms }));
    } catch {
      // Ignore storage failures and keep the editor usable.
    }
  }, [draftKey, issuer, documentMeta, rows, terms]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== draftKey || !event.newValue) return;
      try {
        const parsed = JSON.parse(event.newValue);
        if (parsed.issuer) setIssuer((prev) => ({ ...prev, ...parsed.issuer }));
        if (parsed.documentMeta) setDocumentMeta((prev) => ({ ...prev, ...parsed.documentMeta }));
        if (Array.isArray(parsed.rows) && parsed.rows.length) setRows(parsed.rows);
        if (parsed.terms) setTerms((prev) => ({ ...prev, ...parsed.terms }));
      } catch {
        // Ignore malformed external updates.
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [draftKey]);

  const subtotal = rows.reduce(
    (sum, row) => sum + parseNumber(row.quantity) * parseNumber(row.rate),
    0
  );
  const freightAmount = includeFreightInTotal ? parseNumber(terms.freightAmount) : 0;
  const packingForwardingPercent = includePackingForwardingInTotal ? parseNumber(terms.packingForwardingPercent) : 0;
  const packingForwardingAmount = subtotal * (packingForwardingPercent / 100);
  const taxableBase = subtotal + freightAmount + packingForwardingAmount;
  const taxRate = parseNumber(terms.tax);
  const taxAmount = taxableBase * (taxRate / 100);
  const grandTotal = taxableBase + taxAmount;

  const buildPdfDocument = async () => {
    setGenerating(true);
    try {
      const logoData = await loadImageAsDataURL(logo);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageW = 210;
      const marginX = 10;
      const contentW = pageW - marginX * 2;
      const accent = accentColor || '#667eea';
      const dark = '#111827';
      const muted = '#475569';
      const light = '#f8fafc';

      const drawHeader = () => {
        pdf.setDrawColor(226, 232, 240);
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(marginX, 10, contentW, 34, 2, 2, 'S');

        pdf.addImage(logoData, 'JPEG', marginX + 3, 13, 24, 24);

        pdf.setTextColor(dark);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(17);
        pdf.text(issuer.companyName || 'KUSCO PVT LTD', marginX + 30, 18);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(muted);
        pdf.text(`GST No: ${issuer.gstNo || '________________'}`, marginX + 30, 24);
        pdf.text(`PAN No: ${issuer.panNo || '________________'}`, marginX + 30, 29);
        pdf.text(
          issuer.address || 'Address line',
          marginX + 30,
          34,
          { maxWidth: 98 }
        );
        pdf.text(
          [issuer.phone ? `Ph: ${issuer.phone}` : '', issuer.email || '', issuer.website || '']
            .filter(Boolean)
            .join('  |  '),
          marginX + 30,
          39
        );

        const boxX = 150;
        const boxW = 50;
        pdf.setFillColor(245, 247, 250);
        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(boxX, 12, boxW, 28, 2, 2, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(15);
        pdf.setTextColor(dark);
        pdf.text(documentTitle, boxX + boxW / 2, 19, { align: 'center' });
        pdf.setDrawColor(accent);
        pdf.line(boxX + 4, 22, boxX + boxW - 4, 22);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(muted);
        pdf.text(`${numberLabel}: ${documentMeta[numberField] || 'Draft'}`, boxX + 3, 28);
        pdf.text(`Doc Date: ${documentMeta.documentDate}`, boxX + 3, 32);
      };

      const drawPartySection = (y) => {
        const leftW = 122;
        const rightW = contentW - leftW - 4;

        pdf.setDrawColor(203, 213, 225);
        pdf.setFillColor(255, 255, 255);

        pdf.roundedRect(marginX, y, leftW, 36, 2, 2, 'S');
        pdf.roundedRect(marginX + leftW + 4, y, rightW, 36, 2, 2, 'S');

        pdf.setFillColor(accent);
        pdf.roundedRect(marginX, y, leftW, 8, 2, 2, 'F');
        pdf.roundedRect(marginX + leftW + 4, y, rightW, 8, 2, 2, 'F');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text('BILL TO', marginX + 3, y + 5.5);
        pdf.text('DOCUMENT DETAILS', marginX + leftW + 7, y + 5.5);

        pdf.setTextColor(dark);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.6);

        const billLines = [
          `Company: ${documentMeta.customerName || '________________'}`,
          `Attention: ${documentMeta.customerAttention || '________________'}`,
          `Address: ${documentMeta.customerAddress || '________________'}`,
          `Email: ${documentMeta.customerEmail || '________________'}`,
          `Phone: ${documentMeta.customerPhone || '________________'}`,
          `GST No: ${documentMeta.customerGstNo || '________________'}`,
        ];

        let billY = y + 12;
        billLines.forEach((line) => {
          billY += drawWrappedText(pdf, line, marginX + 3, billY, leftW - 6, 4.2);
        });

        const detailLines = [
          `${numberLabel}: ${documentMeta[numberField] || 'Draft'}`,
          `Inquiry No: ${documentMeta.inquiryNo || '________________'}`,
          `Inquiry Date: ${documentMeta.inquiryDate || '________________'}`,
          `Due Date: ${documentMeta.inquiryDueDate || '________________'}`,
        ];
        let detailY = y + 12;
        detailLines.forEach((line) => {
          detailY += drawWrappedText(pdf, line, marginX + leftW + 7, detailY, rightW - 6, 4.2);
        });
      };

      const drawTableHeader = (y) => {
        const columns = [
          { label: 'Sr', width: 10 },
          { label: 'Item Code', width: 22 },
          { label: 'Description', width: 74 },
          { label: 'Qty', width: 16 },
          { label: 'Unit', width: 16 },
          { label: 'Rate', width: 24 },
          { label: 'Amount', width: 28 },
        ];

        pdf.setDrawColor(51, 65, 85);
        pdf.setFillColor(51, 65, 85);
        let x = marginX;
        columns.forEach((col) => {
          pdf.rect(x, y, col.width, 8, 'F');
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.2);
          pdf.setTextColor(255, 255, 255);
          pdf.text(col.label, x + col.width / 2, y + 5.3, { align: 'center' });
          x += col.width;
        });
        return columns;
      };

      const drawRow = (y, row, srNo, columns) => {
        const descLines = pdf.splitTextToSize(row.description || '', columns[2].width - 4);
        const lineCount = Math.max(1, descLines.length);
        const rowH = Math.max(8, lineCount * 4.6 + 2);
        const amount = parseNumber(row.quantity) * parseNumber(row.rate);
        const values = [
          String(srNo),
          row.itemCode || '',
          descLines,
          row.quantity || '',
          row.unit || '',
          formatMoney(parseNumber(row.rate)),
          formatMoney(amount),
        ];

        let x = marginX;
        pdf.setDrawColor(203, 213, 225);
        pdf.setTextColor(dark);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.6);

        columns.forEach((col, idx) => {
          pdf.rect(x, y, col.width, rowH);
          const textX = x + (idx === 0 ? col.width / 2 : idx === 6 ? col.width - 2 : 2);
          const textOpts = idx === 0 || idx === 6 ? { align: idx === 0 ? 'center' : 'right' } : {};

          if (idx === 2) {
            pdf.text(values[idx], x + 2, y + 5, { maxWidth: col.width - 4 });
          } else {
            pdf.text(values[idx], textX, y + 5, textOpts);
          }
          x += col.width;
        });

        return rowH;
      };

      drawHeader();
      drawPartySection(48);

      const columns = drawTableHeader(88);
      let y = 96;
      rows.forEach((row, index) => {
        const rowHeight = drawRow(y, row, index + 1, columns);
        y += rowHeight;
      });

      const summaryY = Math.max(y + 6, 170);
      const leftW = 122;
      const rightX = marginX + leftW + 4;
      const rightW = contentW - leftW - 4;
      const summaryBoxH = 60;

      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(marginX, summaryY, leftW, summaryBoxH, 2, 2, 'S');
      pdf.roundedRect(rightX, summaryY, rightW, summaryBoxH, 2, 2, 'S');

      pdf.setFillColor(light);
      pdf.rect(marginX, summaryY, leftW, 8, 'F');
      pdf.rect(rightX, summaryY, rightW, 8, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(dark);
      pdf.text('TERMS & CONDITIONS', marginX + 3, summaryY + 5.5);
      pdf.text('TOTAL SUMMARY', rightX + 3, summaryY + 5.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.2);
      pdf.setTextColor(muted);
      const termLines = [
        `${taxLabel}: ${terms.tax || '0'}%`,
        `Payment: ${terms.payment || 'As per mutual agreement'}`,
        `Delivery: ${terms.deliverySchedule || 'As discussed'}`,
        `Packing & Forwarding: ${terms.packingForwardingPercent || '0'}%`,
        ...(showFreightAmountField || includeFreightInTotal ? [`Freight Amount: ${terms.freightAmount ? formatMoney(parseNumber(terms.freightAmount)) : '0.00'}`] : []),
        `Validity: ${terms.validity || 'As per offer'}`,
      ];
      let termY = summaryY + 12;
      termLines.forEach((line) => {
        termY += drawWrappedText(pdf, line, marginX + 3, termY, leftW - 6, 4.1);
      });

      const summaryLines = [
        { label: 'Subtotal', value: formatMoney(subtotal) },
        ...(includePackingForwardingInTotal ? [{ label: 'Packing & Forwarding Amount', value: formatMoney(packingForwardingAmount) }] : []),
        { label: `${taxLabel} ${terms.tax || 0}%`, value: formatMoney(taxAmount) },
        { label: totalLabel, value: formatMoney(grandTotal) },
      ];
      let sumY = summaryY + 14;
      summaryLines.forEach((line, index) => {
        const isTotalRow = line.label === totalLabel;
        pdf.setTextColor(isTotalRow ? dark : muted);
        pdf.setFont('helvetica', isTotalRow ? 'bold' : 'normal');
        pdf.text(line.label, rightX + 3, sumY);
        pdf.text(line.value, rightX + rightW - 3, sumY, { align: 'right' });
        sumY += isTotalRow ? 10 : 8;
      });

      const notesText = terms.notes?.trim();
      if (notesText) {
        const notesY = summaryY + summaryBoxH + 4;
        const notesH = 18;
        pdf.setDrawColor(203, 213, 225);
        pdf.roundedRect(marginX, notesY, contentW, notesH, 2, 2, 'S');
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(marginX, notesY, contentW, 6, 2, 2, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(dark);
        pdf.text('NOTES', marginX + 3, notesY + 4.2);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.2);
        pdf.setTextColor(muted);
        pdf.text(notesText, marginX + 3, notesY + 10, { maxWidth: contentW - 6 });
      }

      pdf.setDrawColor(148, 163, 184);
      pdf.line(marginX, 254, pageW - marginX, 254);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(muted);
      pdf.text(`For ${issuer.companyName || 'KUSCO PVT LTD'}`, marginX, 261);
      pdf.text('Authorized Signatory', pageW - marginX, 261, { align: 'right' });
      pdf.text(
        footerNote || 'This document is computer generated and does not require a signature.',
        marginX,
        268,
        { maxWidth: contentW - 70 }
      );

      return {
        pdf,
        filename: `${filePrefix}-${documentMeta[numberField] || 'draft'}.pdf`,
      };
    } catch {
      // Silent failure keeps the editor usable if rendering hiccups.
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const generatePDF = async () => {
    const result = await buildPdfDocument();
    if (!result) return;
    result.pdf.save(result.filename);
  };

  const shareDocument = async (e) => {
    e.preventDefault();
    setShareError('');
    setShareSuccess('');

    if (!inq?._id) {
      setShareError('Please open this PDF from an inquiry before sharing it.');
      return;
    }
    if (!shareDept) {
      setShareError('Please select a department.');
      return;
    }

    setShareLoading(true);
    try {
      const result = await buildPdfDocument();
      if (!result) return;

      const blob = result.pdf.output('blob');
      const file = new File([blob], result.filename, { type: 'application/pdf' });
      const fd = new FormData();
      fd.append('department', shareDept);
      fd.append('documentType', numberField === 'quotationNo' ? 'quotation' : 'proforma');
      fd.append('comment', shareComment);
      fd.append('attachment', file);

      await customerAPI.shareDocument(inq._id, fd);
      setShareDept('');
      setShareComment('');
      setShareOpen(false);
      setShareSuccess('PDF shared successfully.');
    } catch (err) {
      setShareError(err.response?.data?.message || 'Failed to share PDF.');
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="doc-page">
      <div className="doc-topbar">
        <button
          type="button"
          className="btn-back"
          onClick={() => navigate(`${ROUTES.ADMIN_DEPARTMENT}/Sales%20Coordinator`)}
        >
          <MdArrowBack /> Back
        </button>
        <h2 className="doc-title" style={{ color: titleBarColor || '#111827' }}>{pageTitle}</h2>
      </div>

      <div className="doc-preview">
        <div className="doc-header-strip" style={{ borderColor: accentColor || '#667eea' }}>
          <div className="doc-brand-block">
            <img src={logo} alt="Company logo" className="doc-logo" />
            <div className="doc-brand-copy">
              <input
                name="companyName"
                value={issuer.companyName}
                onChange={handleIssuerChange}
                className="doc-company-name-input"
                placeholder="Company name"
              />
              <input
                name="address"
                value={issuer.address}
                onChange={handleIssuerChange}
                className="doc-company-line-input"
                placeholder="Company address"
              />
              <div className="doc-company-mini-grid">
                <input
                  name="gstNo"
                  value={issuer.gstNo}
                  onChange={handleIssuerChange}
                  placeholder="GST No"
                />
                <input
                  name="panNo"
                  value={issuer.panNo}
                  onChange={handleIssuerChange}
                  placeholder="PAN No"
                />
                <input
                  name="phone"
                  value={issuer.phone}
                  onChange={handleIssuerChange}
                  placeholder="Phone"
                />
                <input
                  name="email"
                  value={issuer.email}
                  onChange={handleIssuerChange}
                  placeholder="Email"
                />
                <input
                  name="state"
                  value={issuer.state}
                  onChange={handleIssuerChange}
                  placeholder="State"
                />
                <input
                  name="stateCode"
                  value={issuer.stateCode}
                  onChange={handleIssuerChange}
                  placeholder="State Code"
                />
                <input
                  name="website"
                  value={issuer.website}
                  onChange={handleIssuerChange}
                  placeholder="Website"
                />
              </div>
            </div>
          </div>

          <div className="doc-meta-card">
            <div className="doc-meta-title" style={{ background: accentColor || '#667eea' }}>
              {documentTitle}
            </div>
            <div className="doc-meta-grid">
              <label>
                <span>{numberLabel}</span>
                <input
                  name={numberField}
                  value={documentNumber || ''}
                  readOnly
                  placeholder={numberPlaceholder}
                  className="doc-number-readonly"
                />
              </label>
              <label>
                <span>Document Date</span>
                <input
                  name="documentDate"
                  type="date"
                  value={documentMeta.documentDate}
                  onChange={handleMetaChange}
                />
              </label>
              <label>
                <span>Inquiry No</span>
                <input
                  name="inquiryNo"
                  value={documentMeta.inquiryNo || ''}
                  readOnly
                  placeholder="Inquiry number"
                  className="doc-number-readonly"
                />
              </label>
              <label>
                <span>Inquiry Date</span>
                <input
                  name="inquiryDate"
                  type="date"
                  value={documentMeta.inquiryDate}
                  onChange={handleMetaChange}
                />
              </label>
              <label className="doc-meta-full">
                <span>Inquiry Due Date</span>
                <input
                  name="inquiryDueDate"
                  type="date"
                  value={documentMeta.inquiryDueDate}
                  onChange={handleMetaChange}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="doc-two-col">
          <section className="doc-section">
            <div className="doc-section-heading">Customer Details</div>
            <div className="doc-form-grid">
              <label>
                <span>Company Name</span>
                <input
                  name="customerName"
                  value={documentMeta.customerName}
                  onChange={handleMetaChange}
                  placeholder="Customer company"
                />
              </label>
              <label>
                <span>Kind Attention</span>
                <input
                  name="customerAttention"
                  value={documentMeta.customerAttention}
                  onChange={handleMetaChange}
                  placeholder="Contact person"
                />
              </label>
              <label>
                <span>Address</span>
                <input
                  name="customerAddress"
                  value={documentMeta.customerAddress}
                  onChange={handleMetaChange}
                  placeholder="Customer address"
                />
              </label>
              <label>
                <span>Email</span>
                <input
                  name="customerEmail"
                  value={documentMeta.customerEmail}
                  onChange={handleMetaChange}
                  placeholder="Customer email"
                />
              </label>
              <label>
                <span>Phone</span>
                <input
                  name="customerPhone"
                  value={documentMeta.customerPhone}
                  onChange={handleMetaChange}
                  placeholder="Customer phone"
                />
              </label>
              <label>
                <span>GST No</span>
                <input
                  name="customerGstNo"
                  value={documentMeta.customerGstNo}
                  onChange={handleMetaChange}
                  placeholder="Customer GST"
                />
              </label>
            </div>
          </section>

          <section className="doc-section">
            <div className="doc-section-heading">Reference Summary</div>
            <div className="doc-summary-cards">
              <div className="doc-summary-card">
                <span>Inquiry</span>
                <strong>{documentMeta.inquiryNo || 'Draft'}</strong>
              </div>
              <div className="doc-summary-card">
                <span>Document</span>
                <strong>{documentMeta[numberField] || 'Draft'}</strong>
              </div>
              <div className="doc-summary-card">
                <span>Customer</span>
                <strong>{documentMeta.customerName || 'Not set'}</strong>
              </div>
              <div className="doc-summary-card">
                <span>Prepared For</span>
                <strong>{documentMeta.customerAttention || 'Not set'}</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="doc-section">
          <div className="doc-section-heading">Items</div>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Item Code</th>
                <th>Description</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Unit</th>
                <th>Amount</th>
                <th className="doc-table-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const amount = parseNumber(row.quantity) * parseNumber(row.rate);

                return (
                  <tr key={index}>
                    <td className="doc-sr">{index + 1}</td>
                    <td>
                      <input
                        name="itemCode"
                        value={row.itemCode}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="Code"
                      />
                    </td>
                    <td>
                      <input
                        name="description"
                        value={row.description}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="Description"
                      />
                    </td>
                    <td>
                      <input
                        name="quantity"
                        type="number"
                        min="0"
                        step="any"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        name="rate"
                        type="number"
                        min="0"
                        step="any"
                        value={row.rate}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="0.00"
                      />
                    </td>
                    <td>
                      <input
                        name="unit"
                        value={row.unit}
                        onChange={(e) => handleRowChange(index, e)}
                        placeholder="Unit"
                      />
                    </td>
                    <td className="doc-amount">{formatMoney(amount)}</td>
                    <td className="doc-table-action">
                      {rows.length > 1 && (
                        <button type="button" className="doc-row-del" onClick={() => removeRow(index)}>
                          <MdDelete />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button type="button" className="doc-add-row" onClick={addRow}>
            <MdAdd /> Add Row
          </button>
        </section>

        <div className="doc-bottom-grid">
          <section className="doc-section doc-summary-section">
            <div className="doc-section-heading">Totals</div>
            <div className="doc-total-line">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>
            {!moveTaxBelowPacking && (
              <div className="doc-total-inline">
                <label>
                  <span>{taxLabel} %</span>
                  <input
                    name="tax"
                    type="number"
                    min="0"
                    step="any"
                    value={terms.tax}
                    onChange={handleTermsChange}
                    placeholder="0"
                  />
                </label>
              </div>
            )}
            {includeFreightInTotal && (
              <div className="doc-total-line">
                <span>Freight Amount</span>
                <strong>{formatMoney(parseNumber(terms.freightAmount))}</strong>
              </div>
            )}
            {includePackingForwardingInTotal && (
              <div className="doc-total-inline">
                <label>
                  <span>Packing &amp; Forwarding %</span>
                  <input
                    name="packingForwardingPercent"
                    type="number"
                    min="0"
                    step="any"
                    value={terms.packingForwardingPercent || ''}
                    onChange={handleTermsChange}
                    placeholder="0"
                  />
                </label>
              </div>
            )}
            {includePackingForwardingInTotal && (
              <div className="doc-total-line">
                <span>Packing &amp; Forwarding Amount</span>
                <strong>{formatMoney(packingForwardingAmount)}</strong>
              </div>
            )}
            {moveTaxBelowPacking && (
              <div className="doc-total-inline">
                <label>
                  <span>{taxLabel} %</span>
                  <input
                    name="tax"
                    type="number"
                    min="0"
                    step="any"
                    value={terms.tax}
                    onChange={handleTermsChange}
                    placeholder="0"
                  />
                </label>
              </div>
            )}
            {moveTaxBelowPacking && (
              <div className="doc-total-line">
                <span>{taxLabel} Amount</span>
                <strong>{formatMoney(taxAmount)}</strong>
              </div>
            )}
            {showTaxAmountLine && (
              <div className="doc-total-line">
                <span>Tax Amount</span>
                <strong>{formatMoney(taxAmount)}</strong>
              </div>
            )}
            <div className="doc-total-line doc-total-line--grand">
              <span>{totalLabel}</span>
              <strong>{formatMoney(grandTotal)}</strong>
            </div>
          </section>

          <section className="doc-section">
            <div className="doc-section-heading">Terms and Conditions</div>
            <div className="doc-form-grid doc-form-grid--terms">
              <label>
                <span>Payment</span>
                <input
                  name="payment"
                  value={terms.payment}
                  onChange={handleTermsChange}
                  placeholder="Payment terms"
                />
              </label>
              <label>
                <span>Delivery Schedule</span>
                <input
                  name="deliverySchedule"
                  value={terms.deliverySchedule}
                  onChange={handleTermsChange}
                  placeholder="Delivery schedule"
                />
              </label>
              <label>
                <span>Packing &amp; Forwarding %</span>
                <input
                  name="packingForwardingPercent"
                  type="number"
                  min="0"
                  step="any"
                  value={terms.packingForwardingPercent || ''}
                  onChange={handleTermsChange}
                  placeholder="0"
                />
              </label>
              {(showFreightAmountField || includeFreightInTotal) && (
                <label>
                  <span>Freight Amount</span>
                  <input
                    name="freightAmount"
                    type="number"
                    min="0"
                    step="any"
                    value={terms.freightAmount || ''}
                    onChange={handleTermsChange}
                    placeholder="Freight amount"
                  />
                </label>
              )}
              <label>
                <span>Validity</span>
                <input
                  name="validity"
                  value={terms.validity}
                  onChange={handleTermsChange}
                  placeholder="Offer validity"
                />
              </label>
              <label className="doc-meta-full">
                <span>Notes</span>
                <textarea
                  name="notes"
                  value={terms.notes}
                  onChange={handleTermsChange}
                  placeholder="Additional notes"
                  rows={3}
                />
              </label>
            </div>
          </section>
        </div>

        <div className="doc-footer">
          <div className="doc-footer-sign">
            <span>Authorized Signatory</span>
            <strong>For {issuer.companyName}</strong>
          </div>
          <p>{footerNote || 'This document was generated electronically and is valid without a signature.'}</p>
        </div>
      </div>

      <div className="doc-bottom-bar">
        <button
          type="button"
          className="doc-pdf-btn"
          onClick={generatePDF}
          disabled={generating}
          style={{
            background: pdfButtonColor || 'linear-gradient(135deg, #667eea, #764ba2)',
          }}
        >
          <MdPictureAsPdf /> {generating ? 'Generating...' : 'Download PDF'}
        </button>
        <button
          type="button"
          className="doc-pdf-btn doc-pdf-btn--share"
          onClick={() => setShareOpen((prev) => !prev)}
          disabled={generating}
        >
          <MdShare /> Share PDF
        </button>
      </div>
      {shareOpen && (
        <form className="doc-share-panel" onSubmit={shareDocument}>
          <div className="doc-share-panel-head">
            <strong>Share PDF with Department</strong>
            <button
              type="button"
              className="doc-share-close"
              onClick={() => setShareOpen(false)}
            >
              <MdClose />
            </button>
          </div>
          {shareError && <p className="doc-share-error">{shareError}</p>}
          {shareSuccess && <p className="doc-share-success">{shareSuccess}</p>}
          <div className="doc-share-grid">
            <label>
              <span>Department</span>
              <select value={shareDept} onChange={(e) => setShareDept(e.target.value)}>
                <option value="">-- Select department --</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </label>
            <label className="doc-share-full">
              <span>Comment</span>
              <textarea
                value={shareComment}
                onChange={(e) => setShareComment(e.target.value)}
                placeholder="Optional note"
                rows={3}
              />
            </label>
          </div>
          <div className="doc-share-actions">
            <button
              type="button"
              className="doc-share-cancel"
              onClick={() => setShareOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="doc-share-send"
              disabled={shareLoading || generating || !shareDept}
            >
              {shareLoading ? 'Sharing...' : 'Send PDF'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default DocumentComposer;
