from diagrams import Diagram, Cluster
from diagrams.programming.flowchart import Action, Decision, StartEnd, Document

with Diagram("GitHub Actions Workflow", show=False, filename="github-actions-workflow"):
    with Cluster("Issue Created"):
        issue = Document("Access Request Issue")
        parse = Action("Parse Issue Content")
        add_comment = Action("Add Approval Options Comment")
        add_labels = Action("Add Labels")
    
    with Cluster("Owner Review"):
        review = Decision("Owner Review")
        approve = Action("/approve Comment")
        deny = Action("/deny Comment")
    
    with Cluster("Approval Process"):
        get_details = Action("Get Request Details")
        add_collab = Action("Add User as Collaborator")
        success_comment = Action("Add Success Comment")
        close_approved = Action("Close Issue as Approved")
    
    with Cluster("Denial Process"):
        denial_comment = Action("Add Denial Comment")
        close_denied = Action("Close Issue as Denied")
    
    # Main flow
    issue >> parse >> add_comment >> add_labels >> review
    
    # Approval path
    review >> approve >> get_details >> add_collab >> success_comment >> close_approved
    
    # Denial path
    review >> deny >> denial_comment >> close_denied
