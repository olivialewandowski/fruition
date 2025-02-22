import React from 'react';
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
  source?: 'waitlist' | 'getStarted' | 'demo';
  prefilledEmail?: string;
}

export function WaitlistDialog({ isOpen, onClose, source = 'waitlist', prefilledEmail = '' }: WaitlistDialogProps) {
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

  React.useEffect(() => {
    if (prefilledEmail) {
      setFormData(prev => ({ ...prev, email: prefilledEmail }));
    }
  }, [prefilledEmail]);

  const validateEmail = (email: string) => {
    return email.toLowerCase().endsWith('.edu');
  };

  const getFormTitle = () => {
    switch (source) {
      case 'demo':
        return 'Request a Demo';
      default:
        return 'Join the Waitlist';
    }
  };

  const getSuccessMessage = () => {
    switch (source) {
      case 'demo':
        return 'Thank you for your request! We will contact you shortly with further details.';
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
      const response = await fetch('https://us-central1-fruition-4e3f8.cloudfunctions.net/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://fruitionresearch.com'
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          institution: formData.institution.trim(),
          role: formData.role,
          source
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
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