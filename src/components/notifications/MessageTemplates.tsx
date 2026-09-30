import React, { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import TextSnippetOutlinedIcon from "@mui/icons-material/TextSnippetOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import Table from "../../common components/Table";
import Pagination from "../../common components/Pagination";
import { getFormattedCurrentDate } from "../../common components/dateUtils";
import {
  INITIAL_TEMPLATES,
  type MessageTemplateItem,
} from "./notificationsData";
import "./notifications.css";

const MessageTemplates: React.FC = () => {
  const [templates, setTemplates] = useState<MessageTemplateItem[]>(INITIAL_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplateItem>(INITIAL_TEMPLATES[1]);
  const [editTemplate, setEditTemplate] = useState<MessageTemplateItem | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New Template form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [eventType, setEventType] = useState<MessageTemplateItem["eventType"]>("Report Ready");
  const [bodyTemplate, setBodyTemplate] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this message template?")) {
      setTemplates(templates.filter((t) => t.id !== id));
      showToast("Message template deleted.");
    }
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTmpl: MessageTemplateItem = {
      id: `TMPL-${Date.now()}`,
      templateCode: code || `TMPL-${Date.now().toString().slice(-4)}`,
      name,
      eventType,
      supportedChannels: ["WhatsApp", "SMS", "In-App"],
      bodyTemplate,
      availableTags: ["{{patient_name}}", "{{test_name}}", "{{lab_name}}", "{{report_url}}"],
      isActive: true,
      lastUpdated: getFormattedCurrentDate(),
    };

    setTemplates([newTmpl, ...templates]);
    setIsAddOpen(false);
    setName("");
    setCode("");
    setBodyTemplate("");
    showToast(`Template '${newTmpl.name}' created successfully!`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTemplate) return;
    setTemplates(templates.map((t) => (t.id === editTemplate.id ? editTemplate : t)));
    setEditTemplate(null);
    showToast("Template updated successfully.");
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.templateCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.eventType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [templates, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTemplates.slice(start, start + rowsPerPage);
  }, [filteredTemplates, currentPage, rowsPerPage]);

  // Live simulation of merge tags
  const renderSimulatedText = (raw: string) => {
    return raw
      .replace(/{{patient_name}}/g, "Raj Kumar")
      .replace(/{{patient_id}}/g, "PAT-1007")
      .replace(/{{test_name}}/g, "Complete Blood Count (CBC)")
      .replace(/{{sample_id}}/g, "SMP-10007")
      .replace(/{{lab_name}}/g, "Lax360 Clinical Labs")
      .replace(/{{report_url}}/g, "https://lax360.med/report/RES-001")
      .replace(/{{doctor_name}}/g, "Dr. K. Ravindran")
      .replace(/{{amount_due}}/g, "450")
      .replace(/{{invoice_no}}/g, "INV-2026-044")
      .replace(/{{payment_link}}/g, "https://lax360.med/pay/44")
      .replace(/{{lab_phone}}/g, "+91 44 2233 4455")
      .replace(/{{date}}/g, getFormattedCurrentDate());
  };

  const columns = [
    "Template Code",
    "Template Name",
    "Event Trigger",
    "Supported Channels",
    "Merge Tags Available",
    "Status",
    "Last Updated",
    "Actions",
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          <CheckCircleOutlineOutlinedIcon className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
            <TextSnippetOutlinedIcon />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Message &amp; Notification Templates
            </h1>
            <p className="text-sm text-slate-500">
              Configure event-triggered communication templates with dynamic placeholder merge tags
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition"
        >
          <AddIcon fontSize="small" />
          Create New Template
        </button>
      </div>

      {/* Live Preview Sandbox Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Template Code & Definition */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{selectedTemplate.name}</h3>
              <p className="text-xs text-slate-500 font-mono">{selectedTemplate.templateCode}</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              {selectedTemplate.eventType}
            </span>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">Raw Template Pattern:</span>
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs font-mono text-slate-800 leading-relaxed">
              {selectedTemplate.bodyTemplate}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-700 block mb-1">Available Merge Tags:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedTemplate.availableTags.map((tag) => (
                <span key={tag} className="placeholder-pill">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Simulation Card */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
              Live Real-Time Substitution Preview
            </span>
            <span className="text-[11px] text-indigo-700 font-medium">Channel: WhatsApp / SMS</span>
          </div>

          {/* Smartphone bubble simulation */}
          <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 text-xs text-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-900">Lax360 Medical Diagnostics</span>
              <span>Today, {getFormattedCurrentDate()}</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed">
              {renderSimulatedText(selectedTemplate.bodyTemplate)}
            </p>
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Placeholders like &#123;&#123;patient_name&#125;&#125; are automatically merged upon event dispatch.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Search */}
        <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fontSize="small" />
            <input
              type="text"
              placeholder="Search template name, code, or event trigger..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Standard Table */}
        <Table
          columns={columns}
          data={paginatedData}
          renderRow={(item: MessageTemplateItem) => (
            <>
              {/* Template Code */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-mono font-bold text-indigo-700 text-xs">
                {item.templateCode}
              </td>

              {/* Template Name */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left font-semibold text-slate-900 text-xs">
                {item.name}
              </td>

              {/* Event Trigger */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs font-medium text-slate-800">
                {item.eventType}
              </td>

              {/* Supported Channels */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs">
                {item.supportedChannels.join(", ")}
              </td>

              {/* Merge Tags Available */}
              <td className="px-4 py-3.5 text-left text-xs text-slate-600 max-w-xs truncate font-mono">
                {item.availableTags.slice(0, 3).join(", ")}
              </td>

              {/* Status */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left">
                <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  {item.isActive ? "Active" : "Disabled"}
                </span>
              </td>

              {/* Last Updated */}
              <td className="whitespace-nowrap px-4 py-3.5 text-left text-xs text-slate-500 font-mono">
                {item.lastUpdated}
              </td>

              {/* Actions: View, Edit, Delete */}
              <td className="whitespace-nowrap px-4 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(item);
                      showToast(`Previewing live template: ${item.name}`);
                    }}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                    title="Preview Live Simulation"
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditTemplate(item)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    title="Edit Template Pattern"
                  >
                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                    title="Delete Template"
                  >
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>
                </div>
              </td>
            </>
          )}
        />

        {/* Standard Pagination with Default 5 Rows */}
        <div className="border-t border-slate-200 bg-white px-4 py-3.5">
          <Pagination
            totalItems={filteredTemplates.length}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </div>
      </div>

      {/* Add Template Right-Side Drawer */}
      {isAddOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setIsAddOpen(false)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <TextSnippetOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create New Message Template</h3>
                  <p className="text-xs text-slate-500">Configure notification text pattern and merge tags</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Critical Potassium Alert"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Template Code</label>
                    <input
                      type="text"
                      placeholder="e.g. TMPL-CRIT-01"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 font-mono text-slate-800 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Event Category</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 font-semibold outline-none focus:border-indigo-500"
                    >
                      <option value="Report Ready">Report Ready</option>
                      <option value="Registration Welcome">Registration Welcome</option>
                      <option value="Payment Reminder">Payment Reminder</option>
                      <option value="Critical Panic Alert">Critical Panic Alert</option>
                      <option value="Report Shared">Report Shared</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Message Body (Insert &#123;&#123;patient_name&#125;&#125;, &#123;&#123;test_name&#125;&#125;, &#123;&#123;report_url&#125;&#125;)
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Dear {{patient_name}}, your {{test_name}} report is ready..."
                    value={bodyTemplate}
                    onChange={(e) => setBodyTemplate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white shadow hover:bg-indigo-700 transition"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Template Right-Side Drawer */}
      {editTemplate && (
        <>
          <div
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-[1px]"
            onClick={() => setEditTemplate(null)}
          />

          <div className="fixed right-0 top-0 z-[9999] flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <EditOutlinedIcon sx={{ fontSize: 22 }} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Template: {editTemplate.templateCode}</h3>
                  <p className="text-xs text-slate-500">{editTemplate.eventType}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditTemplate(null)}
                title="Close"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col justify-between overflow-y-auto">
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    value={editTemplate.name}
                    onChange={(e) => setEditTemplate({ ...editTemplate, name: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-300 px-3 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Message Body Template</label>
                  <textarea
                    rows={6}
                    value={editTemplate.bodyTemplate}
                    onChange={(e) => setEditTemplate({ ...editTemplate, bodyTemplate: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setEditTemplate(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white shadow hover:bg-indigo-700 transition"
                >
                  Update Template
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default MessageTemplates;
