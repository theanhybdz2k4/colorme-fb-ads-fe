import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Copy, Shuffle, Keyboard, Check, Gift } from 'lucide-react';
import { useCodes, useCreateCodes, useDeleteCode, useRewards } from '@/hooks/useEvents';

interface Props {
    eventId: string;
}

export function EventCodeManager({ eventId }: Props) {
    const { data: codes, isLoading } = useCodes(eventId);
    const { data: rewards } = useRewards(eventId);
    const createCodes = useCreateCodes();
    const deleteCode = useDeleteCode();

    const [mode, setMode] = useState<'random' | 'manual'>('random');
    const [prefix, setPrefix] = useState('');
    const [count, setCount] = useState(10);
    const [maxUses, setMaxUses] = useState(1);
    const [rewardId, setRewardId] = useState<string>('random');
    const [manualCodes, setManualCodes] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleGenerate = async () => {
        const payloadRewardId = rewardId === 'random' ? null : rewardId;

        if (mode === 'random') {
            await createCodes.mutateAsync({
                eventId,
                req: { prefix: prefix || undefined, count, max_uses: maxUses, reward_id: payloadRewardId },
            });
        } else {
            const codeList = manualCodes.split('\n').map(c => c.trim()).filter(Boolean);
            if (codeList.length === 0) return;
            await createCodes.mutateAsync({
                eventId,
                req: { codes: codeList, max_uses: maxUses, reward_id: payloadRewardId },
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
        await deleteCode.mutateAsync({ eventId, codeId });
    };

    return (
        <div className="space-y-6">
            {/* Generator */}
            <div className="p-5 rounded-2xl border border-border bg-card space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Tạo mã code
                </h4>

                {/* Mode toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setMode('random')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                            ${mode === 'random' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:border-primary/20'}`}
                    >
                        <Shuffle className="h-4 w-4" /> Random
                    </button>
                    <button
                        onClick={() => setMode('manual')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border
                            ${mode === 'manual' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:border-primary/20'}`}
                    >
                        <Keyboard className="h-4 w-4" /> Nhập tay
                    </button>
                </div>

                {mode === 'random' ? (
                    <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Prefix (tuỳ chọn)</Label>
                            <input
                                type="text"
                                value={prefix}
                                onChange={e => setPrefix(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
                                placeholder="VD: TET"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Số lượng</Label>
                            <input
                                type="number"
                                value={count}
                                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                min={1}
                                max={1000}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Số lần/mã</Label>
                            <input
                                type="number"
                                value={maxUses}
                                onChange={e => setMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                min={1}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Gắn ưu đãi</Label>
                            <select
                                value={rewardId}
                                onChange={e => setRewardId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                            >
                                <option value="random">⚡️ Random (Pool)</option>
                                {rewards?.filter(r => r.is_active).map(r => (
                                    <option key={r.id} value={r.id}>🎁 {r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Nhập mã (mỗi mã 1 dòng)</Label>
                            <textarea
                                value={manualCodes}
                                onChange={e => setManualCodes(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono min-h-[100px] resize-y"
                                placeholder={"SALE2026\nCOLORME50\nTET-VIP"}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-1.5 w-48">
                                <Label className="text-xs">Số lần sử dụng / mã</Label>
                                <input
                                    type="number"
                                    value={maxUses}
                                    onChange={e => setMaxUses(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
                                    min={1}
                                />
                            </div>
                            <div className="space-y-1.5 flex-1">
                                <Label className="text-xs">Gắn ưu đãi</Label>
                                <select
                                    value={rewardId}
                                    onChange={e => setRewardId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
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

                <Button onClick={handleGenerate} disabled={createCodes.isPending} className="gap-2 rounded-xl">
                    {createCodes.isPending ? 'Đang tạo...' : 'Tạo mã'}
                </Button>
            </div>

            {/* Code List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-sm font-bold">{codes?.length || 0} mã code</h4>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full" />
                    </div>
                )}

                {!isLoading && codes && codes.length > 0 && (
                    <div className="rounded-xl bg-white overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Mã</th>
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Ưu đãi</th>
                                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Đã dùng</th>
                                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Tối đa</th>
                                    <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Trạng thái</th>
                                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground w-24"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {codes.map(code => {
                                    const isUsedUp = code.used_count >= code.max_uses;
                                    return (
                                        <tr key={code.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-2.5 font-mono font-bold text-foreground">{code.code}</td>
                                            <td className="px-4 py-2.5">
                                                {code.promo_rewards ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-0.5 rounded-full">
                                                        <Gift className="h-3.5 w-3.5" />
                                                        {code.promo_rewards.name}
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground w-fit px-2 py-0.5 rounded-full border border-border">
                                                        <Shuffle className="h-3 w-3" />
                                                        Random pool
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-2.5 text-center">{code.used_count}</td>
                                            <td className="px-4 py-2.5 text-center">{code.max_uses}</td>
                                            <td className="px-4 py-2.5 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                                                    ${isUsedUp ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                    {isUsedUp ? 'Đã dùng' : 'Còn lại'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleCopy(code.code, code.id)}
                                                    >
                                                        {copiedId === code.id ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(code.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!isLoading && (!codes || codes.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                        Chưa có mã nào. Tạo mã code ở trên để bắt đầu.
                    </div>
                )}
            </div>
        </div>
    );
}
