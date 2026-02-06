<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendInfoMail extends Mailable
{
    use Queueable, SerializesModels;

    public  $email;
    public $status;
    public $account;

    /**
     * Create a new message instance.
     */
    public function __construct($email, $status , $account)
    {
        //
        $this->email  = $email;
        $this->status = $status;
        $this->account = $account;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Send informations Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.send-info',
            with: [
                'email' => $this->email,
                'status' => $this->status,
                'account' => $this->account,

            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}