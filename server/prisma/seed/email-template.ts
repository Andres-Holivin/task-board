import { PrismaClient, EmailType, Prisma } from "@prisma/client";


const emailTemplate: Prisma.EmailTemplateCreateInput[] = [
    {
        id: 'New-Task-Created',
        emailType: EmailType.TASK_CREATED,
        subject: "New Task Created: {{taskTitle}}",
        body: `
            <h3>New Task Created</h3>
            <p>A new task has been created with the following details:</p>
            <ul>
                <li><strong>Title:</strong> {{taskTitle}}</li>
                <li><strong>Description:</strong> {{taskDescription}}</li>
            </ul>
        `,
        createdBy: "system",
        updatedBy: "system",
    }, {
        id: "Summary-Task-Daily",
        emailType: EmailType.SUMMARY_TASKS_DAILY,
        subject: "Daily Task Summary for {{date}}",
        body: `
            <h3>Daily Task Summary</h3>
            <p>Here is your task summary for {{date}}:</p>
            <ul>
                <li><strong>Total Tasks:</strong> {{totalTasks}}</li>
                <li><strong>Completed Tasks:</strong> {{completedTasks}}</li>
                <li><strong>Pending Tasks:</strong> {{pendingTasks}}</li>
            </ul>
        `,
        createdBy: "system",
        updatedBy: "system",
    }

];
async function seedEmailTemplates(prisma: PrismaClient) {
    console.log("🌱 Seeding email templates...");

    try {
        const result = await prisma.emailTemplate.createMany({
            data: emailTemplate,
            skipDuplicates: true, // Skip if already exists
        });

        console.log(`✅ Successfully seeded ${result.count} email templates`);
        return result;
    } catch (error) {
        console.error("❌ Error seeding email templates:", error);
        throw error;
    }
}
export default seedEmailTemplates;