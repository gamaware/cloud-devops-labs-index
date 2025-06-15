from diagrams import Diagram
from diagrams.programming.flowchart import Action, Decision, InputOutput, StartEnd, Database, Document

with Diagram("Repository Access Request Flow", show=False, filename="access-request-flow"):
    start = StartEnd("User Visits\nAccess Form")
    fill_form = Action("Fill Access\nRequest Form")
    validate = Decision("Valid\nInputs?")
    create_issue = Action("Create GitHub\nIssue")
    notify_owner = Action("Notify\nRepository Owner")
    owner_review = Decision("Owner\nApproves?")
    add_collab = Action("Add User as\nCollaborator")
    notify_user = Action("Notify User of\nAccess Grant")
    deny_access = Action("Close Issue\nas Denied")
    end_success = StartEnd("Access\nGranted")
    end_denied = StartEnd("Access\nDenied")
    
    # Main flow
    start >> fill_form >> validate
    validate >> create_issue >> notify_owner >> owner_review
    
    # Approval path
    owner_review >> add_collab >> notify_user >> end_success
    
    # Denial path
    owner_review >> deny_access >> end_denied
    
    # Validation failure path
    validate >> StartEnd("Show Error")
