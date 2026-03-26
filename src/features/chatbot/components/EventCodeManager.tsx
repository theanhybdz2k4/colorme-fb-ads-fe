import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Copy, Shuffle, Keyboard, Check, Gift, Pencil, Save, X } from 'lucide-react';
import { useCodes, useCreateCodes, useDeleteCode, useRewards, useUpdateCode } from '@/hooks/useEvents';

interface Props {
    eventId: string;
}

export function EventCodeManager({ eventId }: Props) {
    const { data: codes, isLoading } = useCodes(eventId);
    const { data: rewards } = useRewards(eventId);
    const createCodes = useCreateCodes();
    const deleteCode = useDeleteCode();
    const updateCode = useUpdateCode();

    const [mode, setMode] = useState<'random' | 'manual'>('random');
    const [prefix, setPrefix] = useState('');
    const [count, setCount] = useState(10);
    const [maxUses, setMaxUses] = useState(1);
    const [isUnlimited, setIsUnlimited] = useState(false);
    const [rewardId, setRewardId] = useState<string>('random');
    const [manualCodes, setManualCodes] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMaxUses, setEditMaxUses] = useState(1);
    const [editIsUnlimited, setEditIsUnlimited] = useState(false);
    const [editRewardId, setEditRewardId] = useState<string>('random');

    const handleGenerate = async () => {
        const payloadRewardId = rewardId === 'random' ? null : rewardId;
        const finalMaxUses = isUnlimited ? 0 : maxUses;

        if (mode === 'random') {
            await createCodes.mutateAsync({
                eventId,
                req: { prefix: prefix || undefined, count, max_uses: finalMaxUses, reward_id: payloadRewardId },
            });
        } else {
            const codeList = manualCodes.split('\n').map(c => c.trim()).filter(Boolean);
            if (codeList.length === 0) return;
            await createCodes.mutateAsync({
                eventId,
                req: { codes: codeList, max_uses: finalMaxUses, reward_id: payloadRewardId },
            });
            setManualCodes('');
        }
    };

    const handleCopy = (code: string, id: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const handleDelete = async (codeId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xoá mã này?')) return;
        await deleteCode.mutateAsync({ eventId, codeId });
    };

    const startEditing = (code: any) => {
        setEditingId(code.id);
        setEditMaxUses(code.max_uses === 0 ? 1 : code.max_uses);
        setEditIsUnlimited(code.max_uses === 0);
        setEditRewardId(code.reward_id || 'random');
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        await updateCode.mutateAsync({
            eventId,
            codeId: editingId,
            req: {
                max_uses: editIsUnlimited ? 0 : editMaxUses,
                reward_id: editRewardId === 'random' ? null : editRewardId,
            },
        });
        setEditingId(null);
    };

    return (
        <div className="space-y-6">
            {/* Generator */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4 shadow-sm">
                <h4 className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Plus className="h-4 w-4 text-primary" /> Tạo mã code
                </h4>

                {/* Mode toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('random')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                            ${mode === 'random' ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' : 'border-border text-muted-foreground hover:border-primary/20 bg-background'}`}
                    >
                        <Shuffle className="h-4 w-4" /> Random
                    </button>
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                            ${mode === 'manual' ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' : 'border-border text-muted-foreground hover:border-primary/20 bg-background'}`}
                    >
                        <Keyboard className="h-4 w-4" /> Nhập tay
                    </button>
                </div>

                {mode === 'random' ? (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground font-semibold">Prefix (tuỳ chọn)</Label>
                            <input
                                type="text"
                                value={prefix}
                                onChange={e => setPrefix(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="VD: TET"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground font-semibold">Số lượng</Label>
                            <input
                                type="number"
                                value={count}
                                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                min={1}
                                max={1000}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-muted-foreground font-semibold">Số lần/mã</Label>
                                <label className="flex items-center gap-1 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isUnlimited}
                                        onChange={e => setIsUnlimited(e.target.checked)}
                                        className="rounded border-border text-primary focus:ring-primary h-3 w-3"
                                    />
                                    <span className="text-[10px] font-medium text-muted-foreground">Vô hạn</span>
                                </label>
                            </div>
                            <input
                                type="number"
                                value={maxUses}
                                disabled={isUnlimited}
                                onChange={e => setMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                                className={`w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isUnlimited ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
                                min={1}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground font-semibold">Gắn ưu đãi</Label>
                            <select
                                value={rewardId}
                                onChange={e => setRewardId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="random">⚡️ Random (Pool)</option>
                                {rewards?.filter(r => r.is_active).map(r => (
                                    <option key={r.id} value={r.id}>🎁 {r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground font-semibold">Nhập mã (mỗi mã 1 dòng)</Label>
                            <textarea
                                value={manualCodes}
                                onChange={e => setManualCodes(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono min-h-[100px] resize-y focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder={"SALE2026\nCOLORME50\nTET-VIP"}
                            />
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="space-y-1.5 w-48">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-muted-foreground font-semibold">Số lần sử dụng / mã</Label>
                                    <label className="flex items-center gap-1 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isUnlimited}
                                            onChange={e => setIsUnlimited(e.target.checked)}
                                            className="rounded border-border text-primary focus:ring-primary h-3 w-3"
                                        />
                                        <span className="text-[10px] font-medium text-muted-foreground">Vô hạn</span>
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    value={maxUses}
                                    disabled={isUnlimited}
                                    onChange={e => setMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                                    className={`w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isUnlimited ? 'opacity-50 cursor-not-allowed bg-muted' : ''}`}
                                    min={1}
                                />
                            </div>
                            <div className="space-y-1.5 flex-1 min-w-[200px]">
                                <Label className="text-xs text-muted-foreground font-semibold">Gắn ưu đãi</Label>
                                <select
                                    value={rewardId}
                                    onChange={e => setRewardId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                >
                                    <option value="random">⚡️ Random (Pool)</option>
                                    {rewards?.filter(r => r.is_active).map(r => (
                                        <option key={r.id} value={r.id}>🎁 {r.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <Button onClick={handleGenerate} disabled={createCodes.isPending} className="gap-2 rounded-xl px-6 h-10 shadow-lg shadow-primary/20">
                    {createCodes.isPending ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                    ) : (
                        <Plus className="h-4 w-4" />
                    )}
                    {createCodes.isPending ? 'Đang tạo...' : 'Tạo mã'}
                </Button>
            </div>

            {/* Code List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-sm font-bold text-foreground">{codes?.length || 0} mã code</h4>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full" />
                    </div>
                )}

                {!isLoading && codes && codes.length > 0 && (
                    <div className="rounded-2xl bg-white overflow-hidden border border-border shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 border-b border-border">
                                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Mã</th>
                                        <th className="text-left px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Ưu đãi</th>
                                        <th className="text-center px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Đã dùng</th>
                                        <th className="text-center px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Tối đa</th>
                                        <th className="text-center px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Trạng thái</th>
                                        <th className="text-right px-5 py-3 font-semibold text-muted-foreground uppercase tracking-wider text-[10px] w-32">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {codes.map(code => {
                                        const isEditing = editingId === code.id;
                                        const isUnlimitedCode = code.max_uses === 0;
                                        const isUsedUp = !isUnlimitedCode && code.used_count >= code.max_uses;

                                        return (
                                            <tr key={code.id} className={`${isEditing ? 'bg-primary/5' : 'hover:bg-muted/20'} transition-colors group`}>
                                                <td className="px-5 py-3 font-mono font-bold text-foreground">
                                                    <span className="flex items-center gap-2">
                                                        {code.code}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    {isEditing ? (
                                                        <select
                                                            value={editRewardId}
                                                            onChange={e => setEditRewardId(e.target.value)}
                                                            className="w-full px-2 py-1 rounded-md border border-border bg-background text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                        >
                                                            <option value="random">⚡️ Random (Pool)</option>
                                                            {rewards?.filter(r => r.is_active).map(r => (
                                                                <option key={r.id} value={r.id}>🎁 {r.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : code.promo_rewards ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full border border-primary/20">
                                                            <Gift className="h-3 w-3" />
                                                            {code.promo_rewards.name}
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground w-fit px-2 py-0.5 rounded-full border border-border bg-background">
                                                            <Shuffle className="h-3 w-3" />
                                                            Random pool
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-center tabular-nums">
                                                    <span className="font-medium text-foreground">{code.used_count}</span>
                                                </td>
                                                <td className="px-5 py-3 text-center tabular-nums">
                                                    {isEditing ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <input
                                                                type="number"
                                                                value={editMaxUses}
                                                                disabled={editIsUnlimited}
                                                                onChange={e => setEditMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                                                                className={`w-16 px-2 py-1 rounded-md border border-border bg-background text-xs text-center outline-none focus:ring-2 focus:ring-primary/20 ${editIsUnlimited ? 'opacity-50' : ''}`}
                                                                min={1}
                                                            />
                                                            <label className="flex items-center gap-1 cursor-pointer select-none">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editIsUnlimited}
                                                                    onChange={e => setEditIsUnlimited(e.target.checked)}
                                                                    className="rounded border-border text-primary h-3 w-3"
                                                                />
                                                                <span className="text-[10px] text-muted-foreground">Vô hạn</span>
                                                            </label>
                                                        </div>
                                                    ) : (
                                                        <span className="font-medium text-foreground">
                                                            {isUnlimitedCode ? (
                                                                <span className="text-lg leading-none" title="Không giới hạn">∞</span>
                                                            ) : code.max_uses}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                                                        ${isUsedUp ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                                                        {isUsedUp ? 'Hết lượt' : 'Còn lại'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {isEditing ? (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                                                                    onClick={handleSaveEdit}
                                                                    disabled={updateCode.isPending}
                                                                >
                                                                    {updateCode.isPending ? (
                                                                        <div className="h-3 w-3 animate-spin border-2 border-green-500/20 border-t-green-500 rounded-full" />
                                                                    ) : (
                                                                        <Save className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground"
                                                                    onClick={() => setEditingId(null)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                                    onClick={() => handleCopy(code.code, code.id)}
                                                                    title="Copy mã"
                                                                >
                                                                    {copiedId === code.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                                                                    onClick={() => startEditing(code)}
                                                                    title="Sửa mã"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                                                    onClick={() => handleDelete(code.id)}
                                                                    title="Xoá mã"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!isLoading && (!codes || codes.length === 0) && (
                    <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border text-muted-foreground text-sm flex flex-col items-center gap-3">
                        <div className="p-3 bg-background rounded-full border border-border">
                            <Shuffle className="h-6 w-6 opacity-20" />
                        </div>
                        Chưa có mã nào. Tạo mã code ở trên để bắt đầu.
                    </div>
                )}
            </div>
        </div>
    );
}
