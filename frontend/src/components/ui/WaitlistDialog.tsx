import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/AlertDialog";

export interface WaitlistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  source?: 'waitlist' | 'getStarted' | 'demo' | 'postProject';
  prefilledEmail?: string;
  projectId?: string | null;
}

// Define a type for our payload to handle the optional projectId correctly
type WaitlistPayload = {
  email: string;
  firstName: string;
  lastName: string;
  institution: string;
  role: string;
  source: 'waitlist' | 'getStarted' | 'demo' | 'postProject';
  projectId?: string;
};

export function WaitlistDialog({ 
  isOpen, 
  onClose, 
  source = 'waitlist', 
  prefilledEmail = '',
  projectId
}: WaitlistDialogProps) {
  const [formData, setFormData] = React.useState({
    email: prefilledEmail,
    firstName: '',
    lastName: '',
    role: '',
    institution: ''
  });
  const [showSuccess, setShowSuccess] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset form data when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: prefilledEmail,
        firstName: '',
        lastName: '',
        role: '',
        institution: ''
      });
      setError('');
    }
  }, [isOpen, prefilledEmail]);

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('.edu');
  };

  const getFormTitle = () => {
    switch (source) {
      case 'demo':
        return 'Request a Demo';
      case 'postProject':
        return 'Sign up to post project';
      default:
        return 'Join the Waitlist';
    }
  };

  const getSuccessMessage = () => {
    switch (source) {
      case 'demo':
        return 'Thank you for your request! We will contact you shortly with further details.';
      case 'postProject':
        return 'Thank you for signing up! We will reach out shortly with the link to our portal.';
      default:
        return "We've added you to our waitlist. We'll notify you as soon as we launch!";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(formData.email)) {
      setError('Invalid university email. Please use a .edu email address.');
      return;
    }

    setIsLoading(true);

    try {
      // Create a base payload 
      const basePayload: WaitlistPayload = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        institution: formData.institution.trim(),
        role: formData.role,
        source
      };

      // Only add projectId if it's a valid string
      if (typeof projectId === 'string' && projectId.trim().length > 0) {
        basePayload.projectId = projectId.trim();
        console.log("Including projectId in payload:", projectId);
      } else {
        console.log("No projectId included in payload");
      }

      console.log("Submitting waitlist form with payload:", basePayload);

      // Try direct Firestore approach first as it's more reliable
      try {
        const { collection, addDoc } = await import("firebase/firestore");
        const { db } = await import("@/config/firebase");
        
        const docRef = await addDoc(collection(db, 'waitlist'), {
          ...basePayload,
          createdAt: new Date().toISOString()
        });
        
        console.log("Added to waitlist with ID:", docRef.id);
        
        // If this has a project ID, update the project with user info
        if (basePayload.projectId) {
          try {
            const { doc, updateDoc } = await import("firebase/firestore");
            const projectRef = doc(db, 'waitlistprojects', basePayload.projectId);
            await updateDoc(projectRef, {
              userEmail: basePayload.email,
              userFirstName: basePayload.firstName,
              userLastName: basePayload.lastName,
              updatedAt: new Date().toISOString(),
              status: 'submitted'
            });
            console.log(`Updated project ${basePayload.projectId} with user info`);
          } catch (projectError) {
            console.error("Error updating project:", projectError);
            // Continue even if project update fails
          }
        }
      } catch (firestoreError) {
        console.error("Direct Firestore approach failed:", firestoreError);
        
        // Fall back to API approach
        console.log("Trying API approach as fallback");
        const response = await fetch('/api/waitlist/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(basePayload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to join waitlist');
        }

        const data = await response.json();
        console.log("Waitlist join API response:", data);
      }

      setShowSuccess(true);
    } catch (err) {
      console.error('Waitlist error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showSuccess} onOpenChange={onClose}>
        <DialogContent 
          className="font-montserrat"
          style={{
            background: 'linear-gradient(to bottom, #FFFFFF 0%, #C494FF 100%)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold text-black">{getFormTitle()}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-black">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="Enter your university email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-black placeholder-gray-400"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-black"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-black"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Role
              </label>
              <select
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-black"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="">Select a role</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Institution
              </label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 px-3 py-2 text-black"
                value={formData.institution}
                onChange={(e) => setFormData({...formData, institution: e.target.value})}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm font-semibold">{error}</div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-semibold text-white bg-purple-950 hover:bg-purple-900 hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showSuccess} onOpenChange={(open) => {
        setShowSuccess(open);
        if (!open) onClose();
      }}>
        <AlertDialogContent className="font-montserrat">
          <AlertDialogHeader>
            <AlertDialogTitle>Thanks for joining!</AlertDialogTitle>
            <AlertDialogDescription>
              {getSuccessMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowSuccess(false);
                onClose();
              }}
              className="w-full bg-purple-950 text-white hover:bg-purple-900 hover:shadow-lg transition-all"
            >
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}