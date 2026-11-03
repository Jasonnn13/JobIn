'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Loading from '@/components/Loading';
import Error from '@/components/Error';
import { useProfile, MAX_PHOTO_BYTES, type Profile, type ProfileUpdate } from '@/hooks/useProfile';

const SKILLS = ['Sewing', 'Repairs', 'Cooking', 'Housework', 'Laundry', 'Painting', 'Driving', 'Construction'];

// Same limits as the database constraints in supabase/migrations.
const schema = z.object({
  username: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name can be at most 100 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^(\+?[0-9]{10,15})?$/, 'Enter 10 to 15 digits, optionally starting with +'),
  occupation: z.string().trim().max(100, 'Occupation can be at most 100 characters'),
  location: z.string().trim().max(100, 'Location can be at most 100 characters'),
  experience: z.string().trim().max(500, 'Experience can be at most 500 characters'),
  description: z.string().trim().max(1000, 'About you can be at most 1000 characters'),
});

type FormData = z.infer<typeof schema>;

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function EditProfileForm({
  profile,
  updateProfile,
}: {
  profile: Profile;
  updateProfile: (fields: ProfileUpdate, photo?: File | null) => Promise<string | null>;
}) {
  const router = useRouter();
  const [skills, setSkills] = useState<string[]>(profile.skills);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: profile.username,
      phone: profile.phone ?? '',
      occupation: profile.occupation ?? '',
      location: profile.location ?? '',
      experience: profile.experience ?? '',
      description: profile.description ?? '',
    },
  });

  // Free the preview's object URL when it's replaced or the form closes.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoError('');
    if (file && file.size > MAX_PHOTO_BYTES) {
      setPhotoError('Choose a photo smaller than 2 MB.');
      e.target.value = '';
      return;
    }
    setPhoto(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const toggleSkill = (skill: string) =>
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));

  const onSubmit = async (data: FormData) => {
    setSaveError('');
    const message = await updateProfile(
      {
        username: data.username,
        phone: data.phone || null,
        occupation: data.occupation || null,
        location: data.location || null,
        experience: data.experience || null,
        description: data.description || null,
        skills,
      },
      photo
    );
    if (message) {
      setSaveError(message);
      return;
    }
    toast.success('Profile saved.');
    router.push('/profile');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="space-y-2">
        <Label htmlFor="photo">Profile photo</Label>
        <div className="flex items-center gap-4">
          <img
            src={previewUrl || profile.photoUrl || '/empty-profile.png'}
            alt=""
            className="size-20 shrink-0 rounded-full bg-muted object-cover"
          />
          <div className="flex-1">
            <Input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} />
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, or WebP, up to 2 MB.</p>
            <FieldError message={photoError} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Full name</Label>
        <Input id="username" autoComplete="name" {...register('username')} aria-invalid={!!errors.username || undefined} />
        <FieldError message={errors.username?.message} />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input value={profile.email} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input id="phone" type="tel" autoComplete="tel" placeholder="+62812345678" {...register('phone')} aria-invalid={!!errors.phone || undefined} />
        <FieldError message={errors.phone?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="occupation">Work headline</Label>
        <Input id="occupation" placeholder="For example: Tailor and pattern maker" {...register('occupation')} />
        <FieldError message={errors.occupation?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">City</Label>
        <Input id="location" autoComplete="address-level2" placeholder="For example: Jakarta Selatan" {...register('location')} />
        <FieldError message={errors.location?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experience">Experience</Label>
        <Textarea id="experience" rows={3} placeholder="Describe your work experience" {...register('experience')} />
        <FieldError message={errors.experience?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">About you</Label>
        <Textarea id="description" rows={3} placeholder="Tell employers a little about yourself" {...register('description')} />
        <FieldError message={errors.description?.message} />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Skills</legend>
        <div className="grid grid-cols-2 gap-3">
          {SKILLS.map((skill) => (
            <label key={skill} className="flex min-h-11 items-center gap-2 rounded-md border px-3">
              <input type="checkbox" checked={skills.includes(skill)} onChange={() => toggleSkill(skill)} className="size-4" />
              {skill}
            </label>
          ))}
        </div>
      </fieldset>

      {saveError && (
        <p role="alert" className="text-sm text-destructive">
          {saveError}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

export default function EditProfilePage() {
  const { profile, loading, updateProfile } = useProfile();
  const router = useRouter();

  if (loading) return <Loading />;
  if (!profile) return <Error />;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
        <Button variant="ghost" className="mb-4 -ml-3" onClick={() => router.back()}>
          <ArrowLeft aria-hidden />
          Back
        </Button>
        <h1 className="text-3xl font-semibold">Edit profile</h1>
        <div className="mt-6 rounded-xl border bg-card p-6">
          <EditProfileForm profile={profile} updateProfile={updateProfile} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
