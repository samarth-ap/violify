import { useState, useEffect } from 'react';
import { Mic, Bell, CreditCard, HelpCircle, LogOut, ChevronRight, Crown, Mail, User as UserIcon, Edit2, Upload, Moon, Sparkles, Zap, BarChart3, HeadphonesIcon, Target, Check } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Switch } from './ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { useDarkMode } from './DarkModeContext';
import { useAuth } from './AuthContext';
import { updateProfile, updateEmail } from 'firebase/auth';
import { toast } from 'sonner';
import { getUserProfile, updateUserProfile } from '../services/firestore';
import logoImage from "../assets/violify-logo.jpeg";

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user, signOut } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load user data from Firestore on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.uid) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setFullName(profile.displayName || '');
            setEmail(profile.email || '');
            setPhone(profile.phone || '');
            setBio(profile.bio || '');
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      }

      // Fallback to Firebase Auth data if Firestore fails
      if (user?.displayName) setFullName(user.displayName);
      if (user?.email) setEmail(user.email);
    };

    loadUserProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      // Update display name in Firebase Auth
      if (fullName !== user.displayName) {
        await updateProfile(user, {
          displayName: fullName
        });
      }

      // Update email in Firebase Auth if changed
      if (email !== user.email && email) {
        await updateEmail(user, email);
      }

      // Save all profile data to Firestore
      await updateUserProfile(user.uid, {
        displayName: fullName,
        email: email,
        phone: phone,
        bio: bio
      });

      toast.success('Profile updated successfully!');
      setIsEditDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);

      if (error?.code === 'auth/requires-recent-login') {
        toast.error('Please log in again to update your email address.');
      } else if (error?.code === 'auth/email-already-in-use') {
        toast.error('This email is already in use by another account.');
      } else if (error?.code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
      } else {
        toast.error(error?.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-background dark:from-orange-950/20 dark:to-background border-b border-border px-6 pt-8 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="mb-6 text-foreground font-bold">Profile & Settings</h1>
          
          {/* Profile Card */}
          <Card className="bg-card border border-border">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 border-4 border-[#FF901F]">
                  <AvatarFallback className="bg-[#FF901F] text-white text-2xl">
                    {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-foreground mb-1">{fullName || 'User'}</h2>
                      <p className="text-muted-foreground text-sm mb-2">{email || 'No email'}</p>
                    </div>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <DialogTrigger asChild>
                        <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                          <Edit2 size={18} className="text-muted-foreground" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Update your profile information and picture
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          {/* Profile Picture */}
                          <div className="flex flex-col items-center gap-3">
                            <Avatar className="w-24 h-24 border-4 border-[#FF901F]">
                              <AvatarFallback className="bg-[#FF901F] text-white text-3xl">
                                {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <Button variant="outline" size="sm" className="gap-2" disabled>
                              <Upload size={16} />
                              Change Picture (Coming Soon)
                            </Button>
                          </div>
                          
                          {/* Full Name */}
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Enter your full name"
                            />
                          </div>
                          
                          {/* Email */}
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="Enter your email"
                            />
                          </div>
                          
                          {/* Phone */}
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="Enter your phone number"
                            />
                          </div>
                          
                          {/* Bio */}
                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Input
                              id="bio"
                              value={bio}
                              onChange={(e) => setBio(e.target.value)}
                              placeholder="Tell us about yourself"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex-1 bg-[#FF901F] hover:bg-[#E67F0C] text-white disabled:opacity-50"
                          >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Badge className="bg-[#FF901F] text-white hover:bg-[#E67F0C]">
                    <UserIcon size={12} className="mr-1" />
                    Student
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-6 lg:grid lg:grid-cols-2 lg:gap-6">
        <div className="lg:col-span-1 space-y-6 mb-6 lg:mb-0">
        {/* Subscription */}
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-[#FF901F] via-[#FFA64D] to-[#FFB366] relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <CardContent className="pt-6 relative z-10">
            {/* Header with Logo */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl p-2 shadow-lg">
                  <img src={logoImage} alt="Violify" className="w-12 h-12 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white">Violify Pro</h3>
                    <Crown className="text-yellow-300" size={20} fill="currentColor" />
                  </div>
                  <p className="text-white/90 text-sm">Premium Membership</p>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <Check className="text-white" size={16} />
                </div>
                <span className="text-white text-sm">Unlimited practice sessions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <Check className="text-white" size={16} />
                </div>
                <span className="text-white text-sm">Advanced AI feedback & analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <Check className="text-white" size={16} />
                </div>
                <span className="text-white text-sm">Priority customer support</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <Check className="text-white" size={16} />
                </div>
                <span className="text-white text-sm">Detailed performance analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <Check className="text-white" size={16} />
                </div>
                <span className="text-white text-sm">Custom practice plans</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-lg p-1.5">
                  <Check className="text-white" size={16} />
                </div>
                <span className="text-white text-sm">Ad-free experience</span>
              </div>
            </div>

            {/* Billing Info */}
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Subscription Plan</span>
                <span className="text-white font-semibold">₹799/month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Next Billing Date</span>
                <span className="text-white font-semibold">Dec 1, 2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/90 text-sm">Status</span>
                <Badge className="bg-green-500 text-white border-0 hover:bg-green-600">Active</Badge>
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-white text-[#FF901F] hover:bg-gray-100 py-3.5 rounded-xl transition-all hover:shadow-lg">
              Manage Subscription
            </button>
          </CardContent>
        </Card>

        {/* Permissions */}
        <div>
          <h3 className="text-foreground mb-3 px-2 font-semibold">Permissions</h3>
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-2">
                      <Moon className="text-[#FF901F]" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Dark Mode</div>
                      <div className="text-xs text-muted-foreground">Switch to dark theme</div>
                    </div>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-2">
                      <Mic className="text-[#FF901F]" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Microphone Access</div>
                      <div className="text-xs text-muted-foreground">For audio analysis</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator className="bg-border" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-2">
                      <Bell className="text-[#FF901F]" size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-foreground">Notifications</div>
                      <div className="text-xs text-muted-foreground">Practice reminders</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

        {/* General Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-foreground mb-3 px-2 font-semibold">General</h3>
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="pt-6">
                <div className="space-y-1">
                  <button className="w-full flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <CreditCard className="text-muted-foreground" size={20} />
                      <span className="text-sm text-foreground">Payment Methods</span>
                    </div>
                    <ChevronRight className="text-muted-foreground" size={20} />
                  </button>

                  <button className="w-full flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="text-muted-foreground" size={20} />
                      <span className="text-sm text-foreground">Email Preferences</span>
                    </div>
                    <ChevronRight className="text-muted-foreground" size={20} />
                  </button>

                  <button className="w-full flex items-center justify-between p-3 hover:bg-accent rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="text-muted-foreground" size={20} />
                      <span className="text-sm text-foreground">Help & Support</span>
                    </div>
                    <ChevronRight className="text-muted-foreground" size={20} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* About */}
          <div>
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground text-sm space-y-1">
                  <p>Violify Version 1.0.0</p>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <button className="text-[#FF901F] hover:underline">Privacy Policy</button>
                    <span>•</span>
                    <button className="text-[#FF901F] hover:underline">Terms of Service</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 p-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors border border-red-200 dark:border-red-900/30"
          >
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
