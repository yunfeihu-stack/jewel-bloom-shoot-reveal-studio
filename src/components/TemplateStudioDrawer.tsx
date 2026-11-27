import React, { useRef, useState } from 'react';
import {
  Check,
  Download,
  Image as ImageIcon,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import {
  exportLevelToJson,
  parseLevelJson,
  type LevelJsonDefinition,
  type LevelRuntime,
} from '../data/levelTemplate';
import { MASCOT_OPTIONS, type MascotId } from '../data/mascots';

interface TemplateStudioDrawerProps {
  activeLevel: LevelRuntime;
  activeLevelJson: LevelJsonDefinition | null;
  mascotId: MascotId;
  customMascotDataUrl: string | null;
  victoryImageDataUrl: string | null;
  outputFilename: string;
  onApplyLevel: (level: LevelRuntime, rawJson: LevelJsonDefinition) => void;
  onResetDefaultLevel: () => void;
  onSelectMascot: (id: MascotId, customDataUrl?: string | null) => void;
  onChangeVictoryImage: (dataUrl: string | null) => void;
  onChangeOutputFilename: (name: string) => void;
}

export const TemplateStudioDrawer: React.FC<TemplateStudioDrawerProps> = ({
  activeLevel,
  activeLevelJson,
  mascotId,
  customMascotDataUrl,
  victoryImageDataUrl,
  outputFilename,
  onApplyLevel,
  onResetDefaultLevel,
  onSelectMascot,
  onChangeVictoryImage,
  onChangeOutputFilename,
}) => {
  const [open, setOpen] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const jsonInputRef = useRef<HTMLInputElement | null>(null);
  const mascotInputRef = useRef<HTMLInputElement | null>(null);
  const victoryInputRef = useRef<HTMLInputElement | null>(null);

  const handleJsonFile = async (file: File) => {
    setJsonError(null);
    setStatusMsg(null);
    try {
      const text = await file.text();
      const parsedRaw = JSON.parse(text) as LevelJsonDefinition;
      const runtime = parseLevelJson(parsedRaw);
      onApplyLevel(runtime, parsedRaw);
      setStatusMsg(`已加载「${runtime.name}」（${runtime.cols}×${runtime.rows}，${runtime.totalBeads} 颗豆子，${runtime.colorKeys.length} 色）`);
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : 'JSON 解析失败，请检查文件格式。');
    }
  };

  const handleDownloadSampleJson = () => {
    const sample = exportLevelToJson(activeLevel);
    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeLevel.name.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'pattern'}_template.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('图片读取失败'));
      reader.readAsDataURL(file);
    });

  const handleCustomMascotUpload = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onSelectMascot('custom', dataUrl);
      setStatusMsg('已切换为自定义进度条角色图片');
    } catch {
      setJsonError('角色图片读取失败');
    }
  };

  const handleVictoryImageUpload = async (file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChangeVictoryImage(dataUrl);
      setStatusMsg('已更新通关弹窗展示图');
    } catch {
      setJsonError('通关图片读取失败');
    }
  };

  const handleExportAppLovin = async () => {
    setExporting(true);
    setJsonError(null);
    setStatusMsg('正在保存模板并打包 AppLovin 单文件 HTML...');
    try {
      const res = await fetch('/api/export-applovin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mascotId,
          customMascotDataUrl,
          levelJson: activeLevelJson,
          victoryImageDataUrl,
          outputFilename: outputFilename.trim() || 'Playable_AppLovin.html',
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        outputPath?: string;
        sizeMb?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || '导出失败');
      }
      setStatusMsg(`导出成功！${data.outputPath}（${data.sizeMb} MB）`);
    } catch (err) {
      setJsonError(
        err instanceof Error
          ? err.message
          : '导出接口不可用，请在本地 npm run dev 环境下使用。'
      );
      setStatusMsg(null);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      {/* Subtle floating dev-only Studio trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed top-2.5 right-2.5 z-50 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold text-[#3b2914] bg-white/90 hover:bg-white border border-[#d6b87c] shadow-md backdrop-blur-xs cursor-pointer transition-transform active:scale-95"
        title="打开试玩模板配置"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
        <span>模板配置</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
        >
          <aside
            className="relative w-full max-w-[360px] h-full bg-[#fffdf8] text-[#2b2116] shadow-2xl border-l border-[#e7d6b4] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#efe2c4] bg-gradient-to-r from-[#fff8e6] to-[#fdf1d4]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="font-display font-extrabold text-sm">试玩模板配置（仅本地可见）</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-amber-100/70 cursor-pointer"
                aria-label="关闭模板配置"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 text-xs">
              {/* Section 1: Pattern JSON */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[13px] text-[#422f18]">1. 待填图案 JSON</h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleDownloadSampleJson}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      示例 JSON
                    </button>
                    {activeLevelJson && (
                      <button
                        type="button"
                        onClick={() => {
                          onResetDefaultLevel();
                          setStatusMsg('已恢复默认樱桃仓鼠图案');
                          setJsonError(null);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        重置
                      </button>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#e6d5b2] bg-[#fffaf0] p-2.5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#6b563a]">
                    <span className="font-bold text-[#3b2a14] truncate">{activeLevel.name}</span>
                    <span>
                      {activeLevel.cols}×{activeLevel.rows} · {activeLevel.totalBeads} 豆 ·{' '}
                      {activeLevel.colorKeys.length} 色
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeLevel.colorKeys.map((k) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white border border-[#e6d7b8] text-[10px]"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/15"
                          style={{ backgroundColor: activeLevel.palette[k]?.base }}
                        />
                        {k} ({activeLevel.colorTotals[k]})
                      </span>
                    ))}
                  </div>
                </div>

                <input
                  ref={jsonInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleJsonFile(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => jsonInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-amber-400/80 hover:border-amber-500 bg-amber-50/60 hover:bg-amber-50 text-amber-900 font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  上传替换图案 JSON（支持 rows / grid / cells）
                </button>
              </section>

              {/* Section 2: Progress Bar Runner Mascot */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[13px] text-[#422f18]">2. 进度条奔跑角色</h3>
                  <button
                    type="button"
                    onClick={() => mascotInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold cursor-pointer"
                  >
                    <ImageIcon className="w-3 h-3" />
                    上传自定义 PNG
                  </button>
                  <input
                    ref={mascotInputRef}
                    type="file"
                    accept="image/png,image/webp,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleCustomMascotUpload(file);
                      e.target.value = '';
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {MASCOT_OPTIONS.map((m) => {
                    const selected = mascotId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onSelectMascot(m.id)}
                        className={`relative rounded-xl p-2 flex flex-col items-center gap-1 border-2 cursor-pointer transition-all ${
                          selected
                            ? 'border-amber-500 bg-amber-50/90 shadow-sm'
                            : 'border-[#e8d9bc] bg-white hover:border-amber-300'
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                        <img
                          src={m.src}
                          alt={m.zhName}
                          className="h-11 w-11 object-contain select-none"
                        />
                        <span className="font-bold text-[11px] leading-tight text-center">
                          {m.zhName}
                        </span>
                        <span className="text-[9px] text-[#8a7555]">
                          {m.category === 'character' ? '人物' : '动物'}
                        </span>
                      </button>
                    );
                  })}

                  {customMascotDataUrl && (
                    <button
                      type="button"
                      onClick={() => onSelectMascot('custom', customMascotDataUrl)}
                      className={`relative rounded-xl p-2 flex flex-col items-center gap-1 border-2 cursor-pointer transition-all ${
                        mascotId === 'custom'
                          ? 'border-amber-500 bg-amber-50/90 shadow-sm'
                          : 'border-[#e8d9bc] bg-white hover:border-amber-300'
                      }`}
                    >
                      {mascotId === 'custom' && (
                        <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                      <img
                        src={customMascotDataUrl}
                        alt="自定义角色"
                        className="h-11 w-11 object-contain select-none"
                      />
                      <span className="font-bold text-[11px] leading-tight">自定义角色</span>
                      <span className="text-[9px] text-[#8a7555]">已上传</span>
                    </button>
                  )}
                </div>
              </section>

              {/* Section 3: Optional Custom Victory Image */}
              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[13px] text-[#422f18]">3. 通关弹窗成品图（可选）</h3>
                  {victoryImageDataUrl && (
                    <button
                      type="button"
                      onClick={() => onChangeVictoryImage(null)}
                      className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                    >
                      清除
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-[#7a6548] leading-snug">
                  替换新 JSON 后若不单独上传，通关时会自动截取拼好的画布作为展示图。
                </p>
                <input
                  ref={victoryInputRef}
                  type="file"
                  accept="image/png,image/webp,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleVictoryImageUpload(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => victoryInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl border border-[#dec89f] bg-white hover:bg-amber-50/50 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  {victoryImageDataUrl ? '更换通关展示图' : '上传自定义通关图（PNG/JPG）'}
                </button>
              </section>

              {/* Section 4: Export Filename */}
              <section className="space-y-1.5">
                <h3 className="font-bold text-[13px] text-[#422f18]">4. 导出文件名</h3>
                <input
                  type="text"
                  value={outputFilename}
                  onChange={(e) => onChangeOutputFilename(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#dcc79e] bg-white text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="T_S_JPJB_var_..._AppLovin.html"
                />
              </section>

              {/* Feedback Messages */}
              {jsonError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-[11px] font-medium">
                  {jsonError}
                </div>
              )}
              {statusMsg && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 text-[11px] font-medium break-all">
                  {statusMsg}
                </div>
              )}
            </div>

            {/* Footer Export CTA */}
            <div className="p-3 border-t border-[#efe2c4] bg-[#fffaf0]">
              <button
                type="button"
                disabled={exporting}
                onClick={() => void handleExportAppLovin()}
                className="w-full py-2.5 rounded-xl font-extrabold text-xs text-white cursor-pointer transition-transform active:scale-[0.98] disabled:opacity-60"
                style={{
                  background: 'linear-gradient(180deg, #5cd62a 0%, #27a811 100%)',
                  boxShadow: '0 3px 0 #166b06',
                }}
              >
                {exporting ? '正在打包 AppLovin HTML...' : '保存配置并导出 AppLovin 单文件 HTML'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
