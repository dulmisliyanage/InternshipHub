import React, { useState } from 'react';
import {
  Search,
  Star,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileEdit,
} from 'lucide-react';
import { ApplicationStatusBadge } from '../../student/applications/ApplicationStatusBadge';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { companyApplicantService } from '../../../services/companyApplicant.service';
import type { ApplicationStatus } from '../../../types/application';

export interface ApplicationStatusWorkflowCardProps {
  currentStatus: ApplicationStatus;
  applicationId: string;
  candidateName: string;
  internshipTitle: string;
  onStatusUpdated: () => void;
  onConflictReload: () => void;
}

const ALLOWED_NEXT_STATUSES: Record<ApplicationStatus, ApplicationStatus[]> = {
  APPLIED: ['UNDER_REVIEW', 'REJECTED'],
  UNDER_REVIEW: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['INTERVIEW', 'REJECTED'],
  INTERVIEW: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export const ApplicationStatusWorkflowCard: React.FC<
  ApplicationStatusWorkflowCardProps
> = ({
  currentStatus,
  applicationId,
  candidateName,
  internshipTitle,
  onStatusUpdated,
  onConflictReload,
}) => {
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Confirmation modal state for terminal decisions
  const [pendingConfirmStatus, setPendingConfirmStatus] =
    useState<ApplicationStatus | null>(null);

  const allowedStatuses = ALLOWED_NEXT_STATUSES[currentStatus] || [];
  const isTerminal =
    currentStatus === 'ACCEPTED' ||
    currentStatus === 'REJECTED' ||
    currentStatus === 'WITHDRAWN';

  const handleExecuteTransition = async (targetStatus: ApplicationStatus) => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await companyApplicantService.updateApplicationStatus(
        applicationId,
        {
          status: targetStatus,
          note: note.trim() ? note.trim() : null,
        }
      );

      setActionSuccess(
        `Application status successfully updated to ${targetStatus.replace(
          '_',
          ' '
        )}.`
      );
      setNote('');
      setPendingConfirmStatus(null);
      onStatusUpdated();
    } catch (err: any) {
      if (err?.status === 409) {
        setActionError(
          'Concurrency conflict: The application was modified by another reviewer or the candidate in the interim. Reloading current details...'
        );
        setPendingConfirmStatus(null);
        setTimeout(() => {
          onConflictReload();
        }, 1200);
      } else {
        setActionError(
          err.message || 'Failed to update application status. Please try again.'
        );
        setPendingConfirmStatus(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiateTransition = (targetStatus: ApplicationStatus) => {
    if (targetStatus === 'ACCEPTED' || targetStatus === 'REJECTED') {
      setPendingConfirmStatus(targetStatus);
    } else {
      handleExecuteTransition(targetStatus);
    }
  };

  return (
    <div
      className="ih-workflow-card"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <span
            style={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            Recruitment Decision Workflow
          </span>
          <h3
            style={{
              margin: '0.2rem 0 0 0',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Application Status Management
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
            Current Status:
          </span>
          <ApplicationStatusBadge status={currentStatus} />
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <Alert
          variant="success"
          message={actionSuccess}
          onClose={() => setActionSuccess(null)}
          style={{ marginBottom: '1.25rem' }}
        />
      )}

      {actionError && (
        <Alert
          variant="error"
          message={actionError}
          onClose={() => setActionError(null)}
          style={{ marginBottom: '1.25rem' }}
        />
      )}

      {/* Terminal Read-Only States */}
      {isTerminal ? (
        <div
          id="terminal-status-banner"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor:
              currentStatus === 'ACCEPTED'
                ? '#F0FDF4'
                : currentStatus === 'REJECTED'
                ? '#FEF2F2'
                : '#F8FAFC',
            border:
              currentStatus === 'ACCEPTED'
                ? '1px solid #BBF7D0'
                : currentStatus === 'REJECTED'
                ? '1px solid #FECACA'
                : '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
          }}
        >
          {currentStatus === 'ACCEPTED' && (
            <>
              <CheckCircle2
                size={22}
                style={{ color: '#16A34A', flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: '#15803D',
                    marginBottom: '0.2rem',
                  }}
                >
                  Application Accepted — Recruitment Closed
                </strong>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: '#166534',
                    lineHeight: 1.5,
                  }}
                >
                  This candidate has been formally accepted for {internshipTitle}.
                  This is a final recruitment status and no further transitions
                  can be made.
                </p>
              </div>
            </>
          )}

          {currentStatus === 'REJECTED' && (
            <>
              <XCircle
                size={22}
                style={{ color: '#DC2626', flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: '#B91C1C',
                    marginBottom: '0.2rem',
                  }}
                >
                  Application Rejected — Recruitment Closed
                </strong>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: '#991B1B',
                    lineHeight: 1.5,
                  }}
                >
                  This application was declined. Rejection is an irreversible
                  terminal status and the candidate cannot be reopened or
                  transitioned.
                </p>
              </div>
            </>
          )}

          {currentStatus === 'WITHDRAWN' && (
            <>
              <AlertCircle
                size={22}
                style={{ color: '#64748B', flexShrink: 0, marginTop: '2px' }}
              />
              <div>
                <strong
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    color: '#334155',
                    marginBottom: '0.2rem',
                  }}
                >
                  Application Withdrawn by Candidate
                </strong>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: '#475569',
                    lineHeight: 1.5,
                  }}
                >
                  {candidateName} withdrew their application for this position.
                  Company decisions are disabled for withdrawn applications.
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        /* Active Status Transition Panel */
        <div>
          {/* Optional Review Note */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="review-note-input"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '0.4rem',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileEdit size={14} style={{ color: 'var(--color-text-muted)' }} />
                Internal Review Note (Optional)
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color:
                    note.length > 900
                      ? 'var(--color-error)'
                      : 'var(--color-text-muted)',
                }}
              >
                {note.length} / 1000
              </span>
            </label>

            <textarea
              id="review-note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={1000}
              placeholder="Add internal feedback, evaluation remarks, or decision rationale (visible only to your hiring team)..."
              disabled={isSubmitting}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                fontSize: '0.875rem',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                resize: 'vertical',
                transition: 'border-color 0.15s ease',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }}
            />
            <span
              style={{
                display: 'block',
                marginTop: '0.3rem',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
              }}
            >
              Note will be recorded in the chronological audit timeline and will
              never be revealed to the student.
            </span>
          </div>

          {/* Action Transition Buttons */}
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '0.785rem',
                fontWeight: 600,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                marginBottom: '0.65rem',
              }}
            >
              Available Next Actions
            </span>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              {allowedStatuses.map((nextStatus) => {
                if (nextStatus === 'UNDER_REVIEW') {
                  return (
                    <Button
                      key={nextStatus}
                      id="action-move-under-review"
                      variant="primary"
                      size="sm"
                      leftIcon={<Search size={15} />}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      onClick={() => handleInitiateTransition('UNDER_REVIEW')}
                    >
                      Move to Under Review
                    </Button>
                  );
                }

                if (nextStatus === 'SHORTLISTED') {
                  return (
                    <Button
                      key={nextStatus}
                      id="action-shortlist"
                      variant="primary"
                      size="sm"
                      leftIcon={<Star size={15} />}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      onClick={() => handleInitiateTransition('SHORTLISTED')}
                    >
                      Shortlist Candidate
                    </Button>
                  );
                }

                if (nextStatus === 'INTERVIEW') {
                  return (
                    <Button
                      key={nextStatus}
                      id="action-invite-interview"
                      variant="primary"
                      size="sm"
                      leftIcon={<Users size={15} />}
                      isLoading={isSubmitting}
                      disabled={isSubmitting}
                      onClick={() => handleInitiateTransition('INTERVIEW')}
                    >
                      Invite to Interview
                    </Button>
                  );
                }

                if (nextStatus === 'ACCEPTED') {
                  return (
                    <button
                      key={nextStatus}
                      id="action-accept-candidate"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleInitiateTransition('ACCEPTED')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.55rem 1rem',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting)
                          e.currentTarget.style.backgroundColor = '#15803D';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting)
                          e.currentTarget.style.backgroundColor = '#16A34A';
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Accept Candidate</span>
                    </button>
                  );
                }

                if (nextStatus === 'REJECTED') {
                  return (
                    <button
                      key={nextStatus}
                      id="action-reject-application"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleInitiateTransition('REJECTED')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        backgroundColor: '#FFF1F2',
                        color: '#E11D48',
                        border: '1px solid #FECDD3',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.55rem 1rem',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        opacity: isSubmitting ? 0.7 : 1,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSubmitting)
                          e.currentTarget.style.backgroundColor = '#FFE4E6';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSubmitting)
                          e.currentTarget.style.backgroundColor = '#FFF1F2';
                      }}
                    >
                      <XCircle size={15} />
                      <span>Reject Application</span>
                    </button>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal for ACCEPTED & REJECTED */}
      {pendingConfirmStatus && (
        <div
          id="status-confirm-modal-backdrop"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            zIndex: 1000,
            backdropFilter: 'blur(3px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setPendingConfirmStatus(null);
            }
          }}
        >
          <div
            id="status-confirm-modal-dialog"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor:
                    pendingConfirmStatus === 'ACCEPTED' ? '#ECFDF5' : '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color:
                    pendingConfirmStatus === 'ACCEPTED' ? '#059669' : '#DC2626',
                  flexShrink: 0,
                }}
              >
                {pendingConfirmStatus === 'ACCEPTED' ? (
                  <CheckCircle2 size={22} />
                ) : (
                  <XCircle size={22} />
                )}
              </div>
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {pendingConfirmStatus === 'ACCEPTED'
                    ? 'Confirm Candidate Acceptance'
                    : 'Confirm Application Rejection'}
                </h4>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Irreversible Recruitment Decision
                </span>
              </div>
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.55,
                margin: '0 0 1.25rem 0',
              }}
            >
              {pendingConfirmStatus === 'ACCEPTED' ? (
                <>
                  Are you sure you want to <strong>accept {candidateName}</strong> for{' '}
                  <strong>{internshipTitle}</strong>? Once confirmed, this decision
                  is final and the candidate will enter the terminal accepted state.
                </>
              ) : (
                <>
                  Are you sure you want to <strong>reject the application</strong> from{' '}
                  <strong>{candidateName}</strong>? Once confirmed, the candidate
                  will be closed out and no further stages can be scheduled.
                </>
              )}
            </p>

            {note.trim() && (
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  marginBottom: '1.25rem',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: '0.2rem',
                  }}
                >
                  Internal Note to Record:
                </span>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-primary)',
                    fontStyle: 'italic',
                  }}
                >
                  "{note.trim()}"
                </span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
              }}
            >
              <Button
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setPendingConfirmStatus(null)}
              >
                Cancel
              </Button>

              {pendingConfirmStatus === 'ACCEPTED' ? (
                <button
                  id="confirm-accept-btn"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleExecuteTransition('ACCEPTED')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: '#16A34A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.55rem 1.15rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>
                    {isSubmitting ? 'Accepting...' : 'Confirm Acceptance'}
                  </span>
                </button>
              ) : (
                <button
                  id="confirm-reject-btn"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleExecuteTransition('REJECTED')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.55rem 1.15rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  <XCircle size={15} />
                  <span>
                    {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
