import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Lock, Save, ShieldCheck, Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarCropper } from '../components/AvatarCropper';

export function ProfilePage() {
    const { user, updateProfile, updatePassword, uploadAvatar, refreshUser } = useAuth();

    // Profile state
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Cropping state
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Sync avatarUrl when user data updates (e.g. after refreshUser)
    useEffect(() => {
        if (user?.avatarUrl) {
            setAvatarUrl(user.avatarUrl);
        }
    }, [user?.avatarUrl]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) { // Increased to 5MB since high-res photos might need cropping
            return toast.error('Kích thước ảnh không được vượt quá 5MB');
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setImageToCrop(reader.result as string);
            setIsCropping(true);
        });
        reader.readAsDataURL(file);

        // Reset input value to allow selecting same file again
        e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsCropping(false);
        setIsUploading(true);

        const file = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });

        try {
            const { url } = await uploadAvatar(file);
            setAvatarUrl(url);
            await updateProfile({ avatar_url: url });
            await refreshUser();
            toast.success('Cập nhật ảnh đại diện thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Không thể tải ảnh lên.');
        } finally {
            setIsUploading(false);
            setImageToCrop(null);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            await updateProfile({ name, email, avatar_url: avatarUrl });
            await refreshUser();
            toast.success('Cập nhật hồ sơ thành công!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể cập nhật hồ sơ');
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Mật khẩu xác nhận không khớp');
        }

        setIsUpdatingPassword(true);
        try {
            await updatePassword({ currentPassword, newPassword });
            toast.success('Đổi mật khẩu thành công!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể đổi mật khẩu');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">Cài đặt tài khoản</h1>
                <p className="text-muted-foreground">Quản lý thông tin hồ sơ và bảo mật của bạn.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar Navigation (Visual only for now) */}
                <div className="space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium transition-colors">
                        <User className="h-4 w-4" />
                        Thông tin cá nhân
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                        <Lock className="h-4 w-4" />
                        Bảo mật
                    </button>
                </div>

                {/* Form area */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Card */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle>Hồ sơ người dùng</CardTitle>
                                    <CardDescription>Cập nhật tên hiển thị và địa chỉ email của bạn.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <form onSubmit={handleUpdateProfile}>
                            <CardContent className="space-y-6">
                                {/* Avatar Section */}
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="relative group">
                                        <Avatar key={avatarUrl} className="h-24 w-24 border-2 border-primary/20 transition-all duration-300 group-hover:border-primary">
                                            <AvatarImage src={avatarUrl || ''} className="object-cover" />
                                            <AvatarFallback className="text-2xl bg-muted">
                                                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Overlay with Upload Option */}
                                        <label
                                            htmlFor="avatar-upload"
                                            className={cn(
                                                "absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-medium text-center p-2",
                                                isUploading && "opacity-100 pointer-events-none"
                                            )}
                                        >
                                            {isUploading ? (
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                            ) : (
                                                <>
                                                    <Camera className="h-6 w-6 mb-1" />
                                                    <span>Thay đổi</span>
                                                </>
                                            )}
                                        </label>
                                        <input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarChange}
                                            disabled={isUploading}
                                        />
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-medium">{user?.name || user?.email}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, GIF. Tối đa 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="name">Họ và tên</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nhập họ tên của bạn"
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="bg-background/50"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
                                <Button type="submit" disabled={isUpdatingProfile} className="ml-auto cursor-pointer">
                                    {isUpdatingProfile ? 'Đang lưu...' : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Lưu thay đổi
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* Password Card */}
                    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle>Bảo mật</CardTitle>
                                    <CardDescription>Đổi mật khẩu để giữ an toàn cho tài khoản.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <form onSubmit={handleChangePassword}>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                                    <Input
                                        id="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="bg-background/50"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-background/50"
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-background/50"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
                                <Button type="submit" disabled={isUpdatingPassword} variant="default" className="ml-auto cursor-pointer">
                                    {isUpdatingPassword ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>

            {imageToCrop && (
                <AvatarCropper
                    image={imageToCrop}
                    open={isCropping}
                    onCropComplete={handleCropComplete}
                    onCancel={() => {
                        setIsCropping(false);
                        setImageToCrop(null);
                    }}
                />
            )}
        </div>
    );
}
