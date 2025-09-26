import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, AlertCircle, CheckCircle } from "lucide-react";
import useStatsStore from "../../../store/stats.store";
import { isItemValid } from "../utils/validation";

const FormSubmission = () => {
  const [ isSubmitting, setIsSubmitting ] = useState( false );
  const [ submitStatus, setSubmitStatus ] = useState( null );
  const statsData = useStatsStore( ( state ) => state.statsData );

  const handleSubmit = async () => {
    setIsSubmitting( true );
    setSubmitStatus( null );

    // Validate all statsData
    const invalidItems = statsData.filter( ( item ) => !isItemValid( item ) );
    if ( invalidItems.length > 0 ) {
      setSubmitStatus( {
        success: false,
        message: `Cannot submit: ${ invalidItems.length } item(s) have validation errors.`,
      } );
      setIsSubmitting( false );
      return;
    }

    try {
      // Simulate API call
      await new Promise( ( resolve ) => setTimeout( resolve, 1000 ) );

      // Success
      setSubmitStatus( {
        success: true,
        message: `Successfully submitted ${ statsData.length } item(s).`,
      } );
    } catch ( error ) {
      // Error
      setSubmitStatus( {
        success: false,
        message: `Error submitting data: ${ error.message }`,
      } );
    } finally {
      setIsSubmitting( false );
    }
  };

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      { submitStatus && (
        <Alert
          className={ `mb-4 ${ submitStatus.success ? "bg-green-900/20 border-green-900" : "bg-red-900/20 border-red-900" }` }
        >
          <div className="flex items-center">
            { submitStatus.success ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            ) }
            <AlertDescription className="text-sm">{ submitStatus.message }</AlertDescription>
          </div>
        </Alert>
      ) }

      <div className="flex justify-end">
        <Button
          onClick={ handleSubmit }
          disabled={ isSubmitting || statsData.length === 0 }
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          { isSubmitting ? "Submitting..." : "Submit All Items" }
        </Button>
      </div>
    </div>
  );
};

export default FormSubmission;
